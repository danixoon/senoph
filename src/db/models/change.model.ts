import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import User from "./user.model";

// TODO: Реализовать строгую динамическую типизацию с помощью рефлексии тайпскрипта
const validTableNames: readonly ChangesTargetName[] = [
  "Department",
  "Holder",
  "Holding",
  "Phone",
  "PhoneCategory",
];
const validDataTypes: readonly ChangedDataType[] = ["date", "number", "string"];

@Table
export default class Change extends Model<
  Models.ChangeAttributes,
  OptionalId<Models.ChangeAttributes>
> {
  @Validate({ isIn: [validTableNames] })
  @AllowNull(false)
  @Column(DataType.STRING)
  target: ChangesTargetName;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  targetId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  value: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  column: string;

  @Validate({ isIn: [validDataTypes] })
  @AllowNull(false)
  @Column(DataType.STRING)
  type: ChangedDataType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId: number;
}
