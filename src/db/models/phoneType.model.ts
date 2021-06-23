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

export type PhoneTypeAttributes = WithId<{
  name: string;
}>;

@Scopes(() => ({
  names: {},
}))
@Table
export default class PhoneType extends Model<
  PhoneTypeAttributes,
  OptionalId<PhoneTypeAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
