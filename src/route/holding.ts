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
import { Op } from "sequelize";
import { Filter } from "@backend/utils/db";
import Phone from "@backend/db/models/phone.model";
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.get(
  "/holdings",
  access("user"),
  validate({
    query: {
      status: tester(),
      ids: tester().array("int"),
      // phoneIds: tester().array("int"),
      // latest: tester().isBoolean(),
    },
  }),
  transactionHandler(async (req, res) => {
    // const { latest, phoneIds } = req.query;
    const { user } = req.params;
    const filter = new Filter(req.query).add("status");
    // const phoneFilter = new Filter({ id: req.query.phoneIds }).add("id", Op.in);

    const holdings = await Holding.findAll({
      include: [
        {
          model: Phone,
          // where: phoneFilter.where,
          attributes: ["id"],
          required: false
          // required: (req.query.phoneIds ?? []).length > 0,
        },
        Holder,
      ],
      order: [["orderDate", "ASC"]],
      where: filter.where,
    });

    res.send(
      prepareItems(
        holdings.map((holding) => ({
          id: holding.id,
          holderId: holding.holderId,
          phoneIds: holding.phones?.map((phone) => phone.id) ?? [],
          reasonId: holding.reasonId,
          status: holding.status,
          authorId: holding.authorId,
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
    const holdingPhones = await HoldingPhone.findAll({
      where: { status: { [Op.not]: null } },
    });

    const groupedItems = groupBy(holdingPhones, (item) => item.holdingId);
    const items: {
      holderId: number;
      commits: ({ phoneId: number } & WithCommit)[];
    }[] = [];

    for (const [key, value] of groupedItems)
      items.push({
        holderId: key,
        commits: value.map(({ holdingId, ...rest }) => rest),
      });

    return prepareItems(items, items.length, 0);
  })
);

router.delete(
  "/holding",
  access("user"),
  validate({
    query: { id: tester().isNumber() },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    await Holding.update({ status: "delete-pending" }, { where: { id } });

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
      phoneIds: tester().array().required(),
      orderFile: tester(),
      orderKey: tester().required(),
    },
  }),
  owner("phone", (req) => req.body.phoneIds),
  transactionHandler(async (req, res) => {
    // TODO: Make file validation
    const { user } = req.params;
    const { file } = req;

    const { holderId, phoneIds, reasonId, description, orderDate, orderKey } =
      req.body;

    const holding = await Holding.create({
      holderId,
      orderUrl: file ? file.path : undefined,
      orderDate: (orderDate as any).toISOString(),
      orderKey,
      authorId: user.id,
      reasonId,
      description,
    });

    // TODO: Make holding create validation

    const phoneHoldings = await HoldingPhone.bulkCreate(
      phoneIds.map((phoneId) => ({ phoneId, holdingId: holding.id }))
    );

    Log.log("holding", [holding.id], "create", user.id);

    res.send({ holdingId: holding.id });
  })
);

router.put(
  "/holding",
  access("admin"),
  validate({
    query: {
      action: tester().isIn(["add", "remove"]).required(),
      phoneIds: tester().array("int").required(),
      holdingId: tester().isNumber().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { action, phoneIds, holdingId } = req.query;
    const holdings = await HoldingPhone.findAll({
      where: {
        phoneId: { [Op.in]: phoneIds },
        holdingId,
        status: null,
      },
    });

    if (holdings.length !== phoneIds.length)
      throw new ApiError(errorType.INVALID_QUERY, {
        description: "Один или более ID средств связи указан неверно.",
      });

    const holdingPhonesIds = holdings.map((h) => h.id);
    const [row, updated] = await HoldingPhone.update(
      {
        status: action === "add" ? "create-pending" : "delete-pending",
        statusAt: new Date().toISOString(),
      },
      { where: { id: { [Op.in]: holdingPhonesIds } } }
    );

    res.send();
  })
);

export default router;
