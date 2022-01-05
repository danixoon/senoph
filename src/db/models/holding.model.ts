import { Op } from "sequelize";
import {
  AllowNull,
  BeforeBulkUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import Department from "./department.model";
import Holder from "./holder.model";
import HoldingPhone from "./holdingPhone.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";
import User from "./user.model";

@Table({ indexes: [{ unique: true, fields: ["orderDate", "orderKey"] }] })
export default class Holding extends Model<
  DB.HoldingAttributes,
  DB.CreateAttributes<DB.HoldingAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  orderDate: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  orderUrl?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  orderKey: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  reasonId: HoldingReason;

  @AllowNull(true)
  @Column(DataType.STRING)
  description: string;

  @ForeignKey(() => Holder)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  holderId: number;

  @BelongsTo(() => Holder)
  holder?: Holder;

  @ForeignKey(() => Department)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  departmentId: number;

  @BelongsTo(() => Department)
  department?: Department;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  authorId: number;

  @BelongsTo(() => User)
  author?: User;

  @AllowNull(true)
  @Validate({ isIn: [["create-pending", "delete-pending"]] })
  @Default("create-pending")
  @Column(DataType.STRING)
  status?: CommitStatus | null;

  //TODO: Auto set status
  @AllowNull(true)
  @Column(DataType.DATE)
  statusAt?: string;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  statusId?: number;

  @BeforeBulkUpdate
  static onBeforeUpdate(args: any) {
    args.fields.push("statusAt");
    args.attributes.statusAt = new Date().toISOString();
  }

  @BelongsToMany(() => Phone, {
    through: { model: () => HoldingPhone, scope: { status: null } },
  })
  phones?: Phone[];

  static async getLast(phoneIds: number[]) {
    const phoneHoldings = await HoldingPhone.findOne({
      where: { phoneId: { [Op.in]: phoneIds } },
      include: Holding,
      order: [["orderDate", "DESC"]],
    });

    return phoneHoldings?.holding;
  }
}
