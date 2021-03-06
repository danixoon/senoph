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
export const validTargetNames: readonly CommitTargetName[] = [
  "holding",
  "phone",
  "category",
];
export const validActionTypes: readonly CommitActionType[] = [
  "approve",
  "decline",
];

@Table
export default class Commit extends Model<
  DB.CommitAttributes,
  DB.CreateAttributes<DB.CommitAttributes>
> {
  @Validate({ isIn: [validTargetNames] })
  @AllowNull(false)
  @Column(DataType.STRING)
  target: CommitTargetName;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  targetId: number;

  @Validate({ isIn: [validActionTypes] })
  @AllowNull(false)
  @Column(DataType.STRING)
  action: CommitActionType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId: number;
}
