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

export type HoldingAttributes = WithId<{
  actDate: Date;
  actKey: string;
  holderId: number;
  phoneId: number;
}>;

@Table
export default class Holding extends Model<
  HoldingAttributes,
  OptionalId<HoldingAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  actDate: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  actKey: string;

  @ForeignKey(() => Holder)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  holderId: number;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;
}
