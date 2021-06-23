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

export type DepartmentAttributes = WithId<{
  name: string;
}>;
@Scopes(() => ({ names: {} }))
@Table
export default class Department extends Model<
  DepartmentAttributes,
  OptionalId<DepartmentAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
