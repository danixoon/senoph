import { query, Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";
import { handler, prepareItems } from "../utils";
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
  handler(async (req, res) => {
    // const { latest, phoneIds } = req.query;

    const filter = new Filter(req.query).add("status");
    // const phoneFilter = new Filter({ id: req.query.phoneIds }).add("id", Op.in);

    const holdings = await Holding.findAll({
      include: [
        {
          model: Phone,
          // where: phoneFilter.where,
          attributes: ["id"],
          // required: (req.query.phoneIds ?? []).length > 0,
        },
        Holder,
      ],
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
          // orderKey: holding.orderKey,
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

router.delete(
  "/holding",
  access("user"),
  validate({
    query: { id: tester().isNumber() },
  }),
  handler(async (req, res) => {
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
    },
  }),
  owner("phone", (req) => req.body.phoneIds),
  handler(async (req, res) => {
    // TODO: Make file validation
    const { user } = req.params;
    const { file } = req;
    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл приказа обязателен",
      });

    const { holderId, phoneIds, reasonId, description, orderDate } = req.body;

    const holding = await Holding.create({
      holderId,
      orderUrl: file.path,
      orderDate: orderDate.toISOString(),
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

export default router;
