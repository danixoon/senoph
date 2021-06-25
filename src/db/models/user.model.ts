import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

@Table
export default class User extends Model<
  Models.UserAttributes,
  OptionalId<Models.UserAttributes>
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
