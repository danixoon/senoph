import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  HasOne,
  BelongsTo
} from "sequelize-typescript";
import {  Optional } from "sequelize/types";
import Department from "./department.model";
import PhoneType from "./phoneType.model";

export type HolderAttributes = WithId<{
  firstName: string;
  lastName: string;
  middleName: string;
  departmentId: number;
}>;

@Table
export default class Holder extends Model<
  HolderAttributes,
  OptionalId<HolderAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  middleName: string;

  @ForeignKey(() => Department)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  departmentId: number;

  @BelongsTo(() => Department)
  department: Department;
}
