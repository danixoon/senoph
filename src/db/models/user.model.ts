import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Unique,
  DefaultScope,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

@Table({ defaultScope: { attributes: ["id", "name", "username", "role"] } })
export default class User extends Model<
  DB.UserAttributes,
  DB.CreateAttributes<DB.UserAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Unique
  @AllowNull(false)
  @Validate({ min: 4 })
  @Column(DataType.STRING)
  username: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  passwordHash: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role: Role;
}
