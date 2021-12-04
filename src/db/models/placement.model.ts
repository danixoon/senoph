import {
  AllowNull,
  Column,
  ForeignKey,
  DataType,
  Model,
  Table,
  Scopes,
  Unique,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";

@Table
export default class Placement extends Model<
  DB.PlacementAttributes,
  DB.CreateAttributes<DB.PlacementAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;
}
