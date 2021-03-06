import { query, Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";
import { groupBy, transactionHandler, prepareItems } from "../utils";
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
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.get(
  "/holding/phones",
  access("user"),
  validate({
    query: {
      holdingId: tester().required().isNumber(),
      ids: tester().array("int"),
      inventoryKey: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { holdingId, ids, inventoryKey } = req.query;

    const filter = new WhereFilter<DB.PhoneAttributes>();
    filter.on("id").optional(Op.in, ids);
    filter.on("inventoryKey").optional(Op.substring, inventoryKey);

    const phones = await Phone.unscoped().findAll({
      where: filter.where,
      include: [
        {
          model: Holding,
          where: { id: holdingId },
          through: { where: { status: null } },
          required: true,
        },
      ],
    });

    res.send(
      prepareItems(
        phones.map((v) => ({ ...v.toJSON(), holdings: undefined })),
        phones.length,
        0
      )
    );
  })
);

router.get(
  "/holdings",
  access("user"),
  validate({
    query: {
      status: tester(),
      ids: tester().array("int"),
      orderKey: tester(),
      orderDate: tester().isDate(),
      holderId: tester().isNumber(),
      departmentId: tester().isNumber(),

      amount: tester().isNumber(),
      offset: tester().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const {
      offset = 0,
      amount,
      orderKey,
      holderId,
      departmentId,
      orderDate,
      status,
      ids,
    } = req.query;
    const { user } = req.params;

    // const filter = new Filter({
    //   ...req.query,
    // })
    //   .add("status")
    //   .add("orderKey", Op.substring)
    //   .add("orderDate");

    const filter = new WhereFilter<DB.HoldingAttributes>();

    filter.on("id").optional(Op.in, ids);
    filter.on("orderKey").optional(Op.eq, orderKey);

    if (status === "based") filter.on("status").optional(Op.eq, null);
    else if (status === "pending") filter.on("status").optional(Op.not, null);
    else filter.on("status").optional(Op.eq, status);

    filter.on("departmentId").optional(Op.eq, departmentId);
    filter.on("holderId").optional(Op.eq, holderId);

    if (orderDate?.getFullYear())
      filter.fn(
        Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("orderDate")),
          orderDate.getFullYear().toString()
        )
      );

    // const phoneFilter = new Filter({ id: req.query.phoneIds }).add("id", Op.in);

    const holdings = await Holding.findAll({
      include: [
        {
          model: Phone.unscoped(),
          // where: phoneFilter.where,
          attributes: ["id"],
          required: false,
          // separate: true,
          // required: (req.query.phoneIds ?? []).length > 0,
        },
        { model: Holder },
      ],
      order: [["orderDate", "ASC"]],
      // limit: amount,
      // offset: offset,
      where: filter.where,
    });

    res.send(
      prepareItems(
        holdings
          .slice(offset, offset + (amount ?? holdings.length))
          .map((holding) => ({
            id: holding.id,
            holderId: holding.holderId,
            phoneIds: holding.phones?.map((phone) => phone.id) ?? [],
            reasonId: holding.reasonId,
            status: holding.status,
            statusId: holding.statusId,
            authorId: holding.authorId,
            departmentId: holding.departmentId,
            orderKey: holding.orderKey,
            orderDate: holding.orderDate,
            orderUrl: holding.orderUrl,
            holder: holding.holder,
          })),
        holdings.length,
        0
      )
    );
  })
);

router.get(
  "/holdings/commit",
  access("user"),
  validate({
    query: {
      status: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const holdingPhones = await HoldingPhone.unscoped().findAll({
      raw: true,
      where: { status: { [Op.not]: null } },
    });

    const holdingGroup = groupBy(holdingPhones, (item) => item.holdingId);

    type HoldingGroup = {
      holdingId: number;
      authorId: number;
      commits: ({ phoneId: number; authorId?: number } & WithCommit)[];
    };

    const items: HoldingGroup[] = [];

    for (const [holdingId, value] of holdingGroup) {
      const authors = groupBy(value, (v) => v.authorId as number);

      for (const [authorId, value] of authors)
        items.push({ holdingId, authorId, commits: value });
    }

    res.send(prepareItems(items, items.length, 0));
  })
);

router.delete(
  "/holding",
  access("user"),
  validate({
    query: { id: tester().isNumber() },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;
    await Holding.update(
      { status: "delete-pending", statusId: user.id },
      { where: { id } }
    );

    res.send();
  })
);

router.post(
  "/holding",
  access("user"),
  upload(".pdf").single("orderFile"),
  validate({
    body: {
      description: tester(),
      orderDate: tester().isDate().required(),
      holderId: tester().isNumber().required(),
      departmentId: tester().isNumber().required(),
      reasonId: tester()
        .isIn([
          "initial",
          "write-off",
          "movement",
          "dismissal",
          "order",
          "other",
        ])
        .required(),
      phoneIds: tester().array("int"),
      orderFile: tester(),
      orderKey: tester().required(),
    },
  }),
  // owner("phone", (req) => req.body.phoneIds),
  transactionHandler(async (req, res) => {
    // TODO: Make file validation
    const { user } = req.params;
    const { file } = req;

    const {
      holderId,
      phoneIds,
      reasonId,
      description,
      orderDate,
      orderKey,
      departmentId,
    } = req.body;

    const holding = await Holding.create({
      holderId,
      orderUrl: file ? file.filename : undefined,
      orderDate: (orderDate as any).toISOString(),
      orderKey,
      authorId: user.id,
      statusId: user.id,
      status: "create-pending",
      reasonId,
      description,
      departmentId,
    });

    // TODO: Make holding create validation

    if (phoneIds && phoneIds?.length > 0)
      await HoldingPhone.bulkCreate(
        phoneIds.map((phoneId) => ({ phoneId, holdingId: holding.id }))
      );

    Log.log("holding", [holding.id], "create", user.id);

    res.send({ holdingId: holding.id });
  })
);

router.put(
  "/holding",
  access("user"),
  validate({
    query: {
      action: tester().isIn(["add", "remove"]).required(),
      phoneIds: tester().array("int").required(),
      holdingId: tester().isNumber().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { action, phoneIds, holdingId } = req.query;

    if (action === "remove") {
      const holdings = await HoldingPhone.unscoped().findAll({
        where: {
          phoneId: { [Op.in]: phoneIds },
          holdingId,
          status: null,
          // statusId: null
        },
      });

      if (holdings.length !== phoneIds.length)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "???????? ?????? ?????????? ID ?????????????? ?????????? ???????????? ??????????????.",
        });

      const holdingPhonesIds = holdings.map((h) => h.id);
      const [row, updated] = await HoldingPhone.unscoped().update(
        {
          status: "delete-pending",
          statusAt: new Date().toISOString(),
          // statusId: user.id,
          authorId: user.id,
        },
        { where: { id: { [Op.in]: holdingPhonesIds } } }
      );
    } else {
      const holdings = await HoldingPhone.unscoped().findAll({
        where: {
          phoneId: { [Op.in]: phoneIds },
          holdingId,
        },
      });

      if (holdings.length > 0)
        throw new ApiError(errorType.INVALID_QUERY, {
          description:
            "???????? ?????? ?????????? ID ?????????????? ?????????? ???????????? ??????????????, ???????? ?????? ???????????????????? ?? ????????????????: " +
            holdings.map((v) => `#${v.phoneId}`),
        });

      const holding = await Holding.unscoped().findByPk(holdingId);
      if (!holding)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "???????????? ID ?????????????????????????????? ????????????????.",
        });

      const creations: DB.HoldingPhoneAttributes[] = phoneIds.map(
        (phoneId) => ({
          phoneId,
          holdingId,
          authorId: user.id,
          status: "create-pending",
          statusAt: new Date().toISOString(),
        })
      );

      await HoldingPhone.bulkCreate(creations);
    }

    res.send();
  })
);

export default router;
