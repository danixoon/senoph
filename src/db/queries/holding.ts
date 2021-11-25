import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Phone from "@backend/db/models/phone.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { ApiError, errorType } from "../../utils/errors";

type HoldingCreation = {
  phoneIds: number[];
  holderId: number;
  orderDate: number;
};

const create = async (authorId: number, creationPhones: HoldingCreation[]) => {
  const phones: DB.PhoneAttributes[] = creationPhones.map((phone) => ({
    ...phone,
    statusAt: new Date().toISOString(),
    authorId,
  }));

  const created = await Phone.bulkCreate(phones);
  return created;
};

export default { create };
