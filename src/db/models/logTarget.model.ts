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
import Log from "./log.model";
import User from "./user.model";

export const validLogTypes: DB.LogType[] = ["create", "delete"];
export const validLogTargetTypes: DB.LogTarget[] = [
  "user",
  "category",
  "phone",
  "holding",
];

@Table
export default class LogTarget extends Model<
  DB.LogTargetAttributes,
  DB.CreateAttributes<DB.LogTargetAttributes>
> {
  @AllowNull(true)
  @Column(DataType.INTEGER)
  targetId: number;

  @ForeignKey(() => Log)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  logId: number;
}
