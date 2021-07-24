import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Scopes,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import PhoneType from "./phoneType.model";

@Scopes(() => ({
  names: {
    attributes: ["id", "name", "phoneTypeId"],
  },
}))
@Table
export default class PhoneModel extends Model<
  DB.PhoneModelAttributes,
  OptionalId<DB.PhoneModelAttributes>
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
}
