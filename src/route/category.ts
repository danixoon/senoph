import { query, Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";
import { transactionHandler, prepareItems, groupBy } from "../utils";
import { access, owner } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import { upload } from "@backend/middleware/upload";
import { ApiError, errorType } from "@backend/utils/errors";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import { convertValues } from "@backend/middleware/converter";
import Holder from "@backend/db/models/holder.model";
import { Op, Sequelize } from "sequelize";
import { Filter, WhereFilter } from "@backend/utils/db";
import Phone from "@backend/db/models/phone.model";
import Category from "@backend/db/models/category.model";
import category from "@backend/db/queries/category";
import CategoryPhone from "@backend/db/models/categoryPhone.model";

const router = AppRouter();

router.get(
  "/categories",
  access("user"),
  validate({
    query: {
      status: tester(),
      ids: tester().array("int"),
      actDate: tester().isDate(),
      actKey: tester(),
      categoryKey: tester(),
      pending: tester().isBoolean(),
    },
  }),
  transactionHandler(async (req, res) => {
    // const filter = new Filter(req.query).add("status");
    const { ids, status, actDate, actKey, categoryKey, pending } = req.query;
    const filter = new WhereFilter<DB.CategoryAttributes>();

    filter.on("id").optional(Op.in, ids);
    filter
      .on("status")
      .optional(Op.eq, status === "based" ? null : status)
      .optional(Op.not, pending ? null : undefined);
    filter.on("actKey").optional(Op.substring, actKey);
    filter.on("categoryKey").optional(Op.eq, categoryKey);

    if (actDate?.getFullYear())
      filter.fn(
        Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("actDate")),
          actDate.getFullYear().toString()
        )
      );

    const categories = await Category.findAll({
      include: [
        {
          model: Phone,
          attributes: ["id"],
        },
      ],
      where: filter.where,
    });

    res.send(
      prepareItems(
        categories.map((category) => ({
          id: category.id,
          actKey: category.actKey,
          actDate: category.actDate,
          actUrl: category.actUrl,
          categoryKey: category.categoryKey,
          phoneIds: category.phones?.map((v) => v.id) ?? [],
          status: category.status,
          statusAt: category.statusAt,
          authorId: category.authorId,
          createdAt: category.createdAt,
          // updatedAt: category.updated
        })),
        categories.length,
        0
      )
    );
  })
);

const checkNewCategory = (
  last: DB.CategoryAttributes | undefined,
  categoryKey: CategoryKey,
  actDate: Date,
  phoneId: number
) => {
  if (last) {
    if (Math.abs(parseInt(last.categoryKey) - parseInt(categoryKey)) !== 1)
      throw new ApiError(errorType.VALIDATION_ERROR, {
        description: `Ошибка для средства связи #${phoneId}: Неккоректный порядок категорий.`,
      });

    if (
      categoryKey !== "2" &&
      parseInt(last.categoryKey) > parseInt(categoryKey)
    )
      throw new ApiError(errorType.VALIDATION_ERROR, {
        description: `Ошибка для средства связи #${phoneId}: Неккоректный порядок категорий, попытка добавить младшую категорию после старшей.`,
      });

    if (
      categoryKey === "2" &&
      last.categoryKey !== "3" &&
      last.categoryKey !== "1"
    )
      throw new ApiError(errorType.VALIDATION_ERROR, {
        description: `Ошибка для средства связи #${phoneId}: Неккоректный порядок категорий, II категорию возможно добавить только после III или I.`,
      });

    if (new Date(last.actDate) >= actDate)
      throw new ApiError(errorType.VALIDATION_ERROR, {
        description: `Ошибка для средства связи #${phoneId}: Неккоректный порядок категорий, дата акта прикрепляемой категории раньше или аналогична дате старшей категории`,
      });
  } else {
    if (categoryKey !== "1" && categoryKey !== "2")
      throw new ApiError(errorType.VALIDATION_ERROR, {
        description: `Ошибка для средства связи #${phoneId}: Неккоректный порядок категорий, первой категория допускается либо I, либо II`,
      });
  }
};

router.post(
  "/category",
  access("user"),
  upload(".pdf").single("actFile"),
  validate({
    body: {
      description: tester(),
      categoryKey: tester().isIn(["1", "2", "3", "4"]).required(),
      phoneIds: tester().array("int").required(),
      actFile: tester(),
      actDate: tester().isDate().required(),
      actKey: tester().required(),
    },
  }),
  owner("phone", (req) => req.body.phoneIds),
  transactionHandler(async (req, res) => {
    // TODO: Make file validation
    const { file } = req;
    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл акта обязателен",
      });

    const { user } = req.params;
    const { categoryKey, actDate, phoneIds, actKey, description } = req.body;

    const targetPhones = await Phone.findAll({
      where: { id: { [Op.in]: phoneIds } },
      include: [Category],
      order: [[Sequelize.literal("`categories.actDate`"), "DESC"]],
    });

    if (targetPhones.length !== phoneIds.length)
      throw new ApiError(errorType.INVALID_QUERY, {
        description: "Одно или несколько ID средств связи указаны неверно",
      });

    for (const phone of targetPhones) {
      const last = phone.categories[0];
      // const getPrevious = (date: Date) => {
      //   if (phone.categories.length > 0) {
      //     const prev = phone.categories.find(
      //       (cat) => new Date(cat.actDate) < date
      //     );
      //     return prev;
      //   }
      // };
      // const getNext = (date: Date) => {
      //   if (phone.categories.length > 0) {
      //     const next = [...phone.categories]
      //       .reverse()
      //       .find((cat) => new Date(cat.actDate) > date);
      //     return next;
      //   }
      // };
      // const getSiblings = (date: Date) => [getPrevious(date), getNext(date)];
      checkNewCategory(last, categoryKey, actDate, phone.id);
    }
    const cat = await category.create(user.id, {
      actDate,
      phoneIds,
      actKey,
      actUrl: file.filename,
      categoryKey,
      description,
    });

    res.send({ id: cat.id });
  })
);

router.get(
  "/categories/commit",
  access("user"),
  validate({
    query: {
      status: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const categoryPhones = await CategoryPhone.unscoped().findAll({
      where: { status: { [Op.not]: null } },
    });

    const groupedItems = groupBy(categoryPhones, (item) => item.categoryId);
    const items: {
      categoryId: number;
      commits: ({ phoneId: number } & WithCommit)[];
    }[] = [];

    for (const [key, value] of groupedItems)
      items.push({
        categoryId: key,
        commits: value.map((item) => item.toJSON()),
      });

    res.send(prepareItems(items, items.length, 0));
  })
);

router.put(
  "/category",
  access("admin"),
  validate({
    query: {
      action: tester().isIn(["add", "remove"]).required(),
      phoneIds: tester().array("int").required(),
      categoryId: tester().isNumber().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { action, phoneIds, categoryId } = req.query;

    const targetCategory = await Category.findByPk(categoryId);

    if (!targetCategory)
      throw new ApiError(errorType.NOT_FOUND, {
        description: `Категория с ID #${categoryId} не найдена.`,
      });

    const targetPhones = await Phone.findAll({
      where: { id: { [Op.in]: phoneIds } },
      include: [Category],
      order: [[Sequelize.literal("`categories.actDate`"), "DESC"]],
    });

    if (action === "remove") {
      const categories = await CategoryPhone.unscoped().findAll({
        where: {
          phoneId: { [Op.in]: phoneIds },
          categoryId,
          status: null,
        },
      });

      if (categories.length !== phoneIds.length)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Один или более ID средств связи указан неверно.",
        });

      for (const cat of categories) {
        const phone = targetPhones.find((p) => p.id === cat.phoneId);
        const last = phone?.categories[0];

        if (last?.id !== cat.categoryId)
          throw new ApiError(errorType.VALIDATION_ERROR, {
            description: `Невозможно удалить из категории #${cat.categoryId} средство связи #${cat.phoneId}. Удаление возможно только из старшей категории средства связи.`,
          });
      }

      const categoryPhonesIds = categories.map((h) => h.id);
      const [row, updated] = await CategoryPhone.unscoped().update(
        {
          status: "delete-pending",
          statusAt: new Date().toISOString(),
        },
        { where: { id: { [Op.in]: categoryPhonesIds } } }
      );
    } else {
      const categories = await CategoryPhone.unscoped().findAll({
        where: {
          phoneId: { [Op.in]: phoneIds },
          categoryId,
        },
      });

      if (categories.length > 0)
        throw new ApiError(errorType.INVALID_QUERY, {
          description:
            "Один или более ID средств связи указан неверно, либо уже существует в категории с данным актом" +
            categories.map((v) => `#${v.phoneId}`),
        });

      for (const phone of targetPhones) {
        const last = phone.categories[0];
        checkNewCategory(
          last,
          targetCategory.categoryKey,
          new Date(targetCategory.actDate),
          phone.id
        );
      }

      const category = await Category.unscoped().findByPk(categoryId);
      if (!category)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Указан ID несуществующего акта категории.",
        });

      const creations: DB.CategoryPhoneAttributes[] = phoneIds.map(
        (phoneId) => ({
          phoneId,
          categoryId,
          status: "create-pending",
          statusAt: new Date().toISOString(),
        })
      );

      await CategoryPhone.bulkCreate(creations);
    }

    res.send();
  })
);

router.delete(
  "/category",
  access("user"),
  validate({
    query: { id: tester().isNumber() },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    await Category.update({ status: "delete-pending" }, { where: { id } });

    res.send();
  })
);

export default router;
