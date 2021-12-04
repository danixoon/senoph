import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Phone from "@backend/db/models/phone.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { ApiError, errorType } from "../../utils/errors";
import Holding from "../models/holding.model";
import HoldingPhone from "../models/holdingPhone.model";

type HoldingCreation = {
  phoneIds: number[];
  holderId: number;
  departmentId: number;
  orderDate: Date;
  orderKey: string;
  orderUrl?: string;
  reasonId: HoldingReason;
};

const create = async (
  authorId: number,
  { phoneIds, ...payload }: HoldingCreation
) => {
  const holdingAttr: DB.HoldingAttributes = {
    ...payload,
    orderDate: payload.orderDate.toISOString(),
    authorId,
  };

  const holding = await Holding.create(holdingAttr);
  const holdingPhones = await HoldingPhone.bulkCreate(
    phoneIds.map((id) => ({ phoneId: id, holdingId: holding.id }))
  );

  return holding;
};

export default { create };
