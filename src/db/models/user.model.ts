import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

export type UserAttributes = WithId<{
  username: string;
  passwordHash: string;
  role: Role;
}>;

@Table
export default class User extends Model<
  UserAttributes,
  OptionalId<UserAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  username!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  passwordHash!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role!: Role;
}
