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

@Table
export default class Holding extends Model<
  DB.HoldingAttributes,
  DB.CreateAttributes<DB.HoldingAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  orderDate: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  orderUrl: string;

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

  @AllowNull(true)
  @Validate({ isIn: [["create-pending", "delete-pending"]] })
  @Default("create-pending")
  @Column(DataType.STRING)
  status?: CommitStatus | null;

  //TODO: Auto set status
  @AllowNull(true)
  @Column(DataType.DATE)
  statusAt?: string;

  @BeforeBulkUpdate
  static onBeforeUpdate(args: any) {
    args.fields.push("statusAt");
    args.attributes.statusAt = new Date().toISOString();
  }

  @BelongsTo(() => Holder)
  holder: Holder;

  @BelongsToMany(() => Phone, () => HoldingPhone)
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
