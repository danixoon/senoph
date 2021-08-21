import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import Department from "./department.model";
import Holder from "./holder.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";

@Table
export default class PhoneCategory extends Model<
  DB.PhoneCategoryAttributes,
  DB.CreateAttributes<DB.PhoneCategoryAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  date: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  category: string;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;
}
