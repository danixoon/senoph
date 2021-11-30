import {
  AllowNull,
  BeforeBulkUpdate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import Department from "./department.model";
import Holder from "./holder.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";

@Table
export default class PhoneCategory extends Model<
  DB.PhoneCategoryAttributes,
  DB.CreateAttributes<DB.PhoneCategoryAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  actDate: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  categoryKey: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  actUrl: string;

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

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;

  @BelongsTo(() => Phone, { onDelete: "CASCADE" })
  phone?: Phone;


  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;
}
