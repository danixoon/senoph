import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import Department from "./department.model";
import Holder from "./holder.model";
import Holding from "./holding.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";
import User from "./user.model";

@Table({ defaultScope: { where: { status: null } } })
export default class HoldingPhone extends Model<
  DB.HoldingPhoneAttributes,
  DB.CreateAttributes<DB.HoldingPhoneAttributes>
> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  // TODO: On Delete Cascade
  @ForeignKey(() => Holding)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  holdingId: number;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  auhtorId?: number;

  @AllowNull(true)
  @Validate({ isIn: [["create-pending", "delete-pending"]] })
  @Default(null)
  @Column(DataType.STRING)
  status?: CommitStatus | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  statusAt?: string;

  @BelongsTo(() => Holding, { onDelete: "CASCADE" })
  holding?: Holding;

  @BelongsTo(() => Phone, { onDelete: "CASCADE" })
  phone?: Phone;

  @BelongsTo(() => User)
  author?: User;
}
