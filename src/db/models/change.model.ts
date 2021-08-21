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
export const validTableNames: readonly ChangesTargetName[] = [
  "department",
  "holder",
  "holding",
  "phone",
  "phoneCategory",
];
export const validDataTypes: readonly ChangedDataType[] = ["date", "number", "string"];


class DbModel<T, K> extends Model<T, K>  {
  createdAt: string;
}

@Table
export default class Change extends DbModel<
  DB.ChangeAttributes,
  DB.CreateAttributes<DB.ChangeAttributes>
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
