import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  Validate,
  HasMany,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import LogTarget from "./logTarget.model";
import User from "./user.model";

export const validLogTypes: DB.LogType[] = ["create", "delete", "commit"];
export const validLogTargetTypes: DB.LogTarget[] = [
  "user",
  "category",
  "phone",
  "holdingPhone",
  "categoryPhone",
  "holding",
  "model",
  "department",
  "placement",
  "phoneType",
  "holder",
];

@Table
export default class Log extends Model<
  DB.LogAttributes,
  DB.CreateAttributes<DB.LogAttributes>
> {
  static async log(
    target: DB.LogTarget,
    targetIds: number[],
    type: DB.LogType,
    authorId: number,
    payload?: any
  ) {
    const log = await Log.create({ target, type, authorId, payload });

    await LogTarget.bulkCreate(
      targetIds.map((targetId) => ({ targetId, logId: log.id }))
    );

    return log;
  }

  @Validate({ isIn: [validLogTargetTypes] })
  @AllowNull(false)
  @Column(DataType.STRING)
  target: DB.LogTarget;

  @HasMany(() => LogTarget)
  targets: number[];

  @Validate({ isIn: [validLogTypes] })
  @AllowNull(false)
  @Column(DataType.STRING)
  type: DB.LogType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  authorId: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(4000),
    get() {
      if (this.getDataValue("payload"))
        return JSON.parse(this.getDataValue("payload"));
      else return null;
    },
    set(this: Log, v: any) {
      this.setDataValue("payload", JSON.stringify(v));
    },
  })
  payload: any | null;
}
