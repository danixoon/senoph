import {
  AllowNull,
  Column,
  ForeignKey,
  DataType,
  Model,
  Table,
  Scopes,
  Unique,
  BelongsTo,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import Placement from "./placement.model";

@Scopes(() => ({ names: {} }))
@Table
export default class Department extends Model<
  DB.DepartmentAttributes,
  DB.CreateAttributes<DB.DepartmentAttributes>
> {
  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;

  @ForeignKey(() => Placement)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  placementId?: number;

  @BelongsTo(() => Placement, { onDelete: "SET NULL" })
  placement?: Placement;
}
