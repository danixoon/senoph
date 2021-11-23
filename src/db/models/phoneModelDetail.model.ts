import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Scopes,
  BelongsTo,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import Phone from "./phone.model";
import PhoneModel from "./phoneModel.model";

import PhoneType from "./phoneType.model";

@Table
export default class PhoneModelDetail extends Model<
  DB.PhoneModelDetailAttributes,
  DB.CreateAttributes<DB.PhoneModelDetailAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  type: DB.PhoneModelDetailType;

  @AllowNull(false)
  @Column(DataType.STRING)
  units: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: string;

  @ForeignKey(() => PhoneModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  modelId: number;

  @BelongsTo(() => PhoneModel, { onDelete: "CASCADE" })
  phoneModel?: PhoneModel;
}
