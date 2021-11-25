import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Phone from "@backend/db/models/phone.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { ApiError, errorType } from "../../utils/errors";

type PhoneCreation = {
  phoneModelId: number;
  inventoryKey?: string;
  factoryKey?: string;
  assemblyDate: string;
  accountingDate: string;
  commissioningDate: string;
};

const create = async (authorId: number, creationPhones: PhoneCreation[]) => {
  const phones: DB.PhoneAttributes[] = creationPhones.map((phone) => ({
    ...phone,
    statusAt: new Date().toISOString(),
    authorId,
  }));

  const created = await Phone.bulkCreate(phones);
  return created;
};

export default { create };
