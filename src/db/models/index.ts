import { Model, ModelStatic } from "sequelize";
import Commit from "./commit.model";
import Department from "./department.model";
import Holder from "./holder.model";
import Holding from "./holding.model";
import Phone from "./phone.model";
import PhoneCategory from "./phoneCategory.model";
import PhoneModel from "./phoneModel.model";

// export const models = {
//   phone: Phone,
//   phoneModel: PhoneModel,
//   commit: Commit,
//   phoneCategory: PhoneCategory,
//   department: Department,
//   holder: Holder,
//   holding: Holding,
// };

// export const getModel = (name: keyof typeof models) => {
//   return models[name] as any as typeof Model;
// };
