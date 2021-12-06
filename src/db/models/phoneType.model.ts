import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Scopes,
  Unique,
} from "sequelize-typescript";

import { Optional } from "sequelize/types";

@Scopes(() => ({
  names: {},
}))
@Table
export default class PhoneType extends Model<
  DB.PhoneTypeAttributes,
  DB.CreateAttributes<DB.PhoneTypeAttributes>
> {
  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  lifespan: number;
}
