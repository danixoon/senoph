import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Unique,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

@Table
export default class User extends Model<
  DB.UserAttributes,
  OptionalId<DB.UserAttributes>
> {
  @Unique
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
