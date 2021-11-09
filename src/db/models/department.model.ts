import {
  AllowNull,
  Column,
  ForeignKey,
  DataType,
  Model,
  Table,
  Scopes,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

@Scopes(() => ({ names: {} }))
@Table
export default class Department extends Model<
  DB.DepartmentAttributes,
  DB.CreateAttributes<DB.DepartmentAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;
}


