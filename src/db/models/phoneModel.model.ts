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

export type PhoneModelAttributes = WithId<{
  name: string;
  accountingDate: Date;
  phoneTypeId: number;
}>;

@Scopes(() => ({
  names: {
    attributes: ["id", "name", "phoneTypeId"],
  },
}))
@Table
export default class PhoneModel extends Model<
  PhoneModelAttributes,
  OptionalId<PhoneModelAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  accountingDate: Date;

  @ForeignKey(() => PhoneType)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneTypeId: number;
}
