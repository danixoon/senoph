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

@Scopes(() => ({
  names: {},
}))
@Table
export default class PhoneType extends Model<
  DB.PhoneTypeAttributes,
  OptionalId<DB.PhoneTypeAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
