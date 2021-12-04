import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Phone from "@backend/db/models/phone.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { ApiError, errorType } from "../../utils/errors";
import Category from "../models/category.model";
import CategoryPhone from "../models/categoryPhone.model";
import Holding from "../models/holding.model";
import HoldingPhone from "../models/holdingPhone.model";
import { v4 as uuid } from "uuid";

type CategoryCreation = {
  phoneIds: number[];
  actDate: Date;
  categoryKey: CategoryKey;
  actKey: string;
  actUrl: string;
  description?: string;
};

const create = async (
  authorId: number,
  { phoneIds, ...payload }: CategoryCreation
) => {
  const categoryAttr: DB.CategoryAttributes = {
    ...payload,
    actDate: payload.actDate.toISOString(),
    authorId,
  };

  const category = await Category.create(categoryAttr);
  const categoryPhones = await CategoryPhone.bulkCreate(
    phoneIds.map((id) => ({ phoneId: id, categoryId: category.id }))
  );

  return category;
};

const createMany = async (authorId: number, creations: CategoryCreation[]) => {
  const categoryPhonesAttr: DB.CategoryPhoneAttributes[] = [];
  const categoryAttr: DB.CategoryAttributes[] = creations.map((payload) => {
    return {
      ...payload,
      actDate: payload.actDate.toISOString(),
      authorId,
    };
  });

  const categories = await Category.bulkCreate(categoryAttr);
  for (let i = 0; i < categories.length; i++) {
    const creation = creations[i];
    const category = categories[i];
    for (const id of creation.phoneIds)
      categoryPhonesAttr.push({ phoneId: id, categoryId: category.id });
  }
  const categoryPhones = await CategoryPhone.bulkCreate(categoryPhonesAttr);

  return categories;
};

export default { create, createMany };
