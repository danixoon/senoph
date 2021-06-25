import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  HasOne,
  BelongsTo,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import Department from "./department.model";
import PhoneType from "./phoneType.model";

@Table
export default class Holder extends Model<
  Models.HolderAttributes,
  OptionalId<Models.HolderAttributes>
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
