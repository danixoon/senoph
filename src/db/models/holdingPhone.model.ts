import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

import Department from "./department.model";
import Holder from "./holder.model";
import Holding from "./holding.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";

@Table
export default class HoldingPhone extends Model<
  DB.HoldingPhoneAttributes,
  DB.CreateAttributes<DB.HoldingPhoneAttributes>
> {
  // TODO: On Delete Cascade
  @ForeignKey(() => Holding)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  holdingId: number;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;

  @BelongsTo(() => Holding, { onDelete: "CASCADE" })
  holding?: Holding;

  @BelongsTo(() => Phone, { onDelete: "CASCADE" })
  phone?: Phone;
}
