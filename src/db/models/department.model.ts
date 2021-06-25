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
  Models.DepartmentAttributes,
  OptionalId<Models.DepartmentAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
