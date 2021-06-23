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

export type PhoneCategoryAttribues = WithId<{
  date: Date;
  category: string;
  phoneId: number;
}>;

@Table
export default class PhoneCategory extends Model<
  PhoneCategoryAttribues,
  OptionalId<PhoneCategoryAttribues>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  date: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  category: string;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;
}
