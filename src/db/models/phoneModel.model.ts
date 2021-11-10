import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Scopes,
  HasMany,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import PhoneModelDetail from "./phoneModelDetail.model";

import PhoneType from "./phoneType.model";

@Scopes(() => ({
  names: {
    attributes: ["id", "name", "phoneTypeId"],
  },
}))
@Table
export default class PhoneModel extends Model<
  DB.PhoneModelAttributes,
  DB.CreateAttributes<DB.PhoneModelAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  accountingDate: string;

  @ForeignKey(() => PhoneType)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneTypeId: number;

  @HasMany(() => PhoneModelDetail)
  details: PhoneModelDetail[];

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;
}
