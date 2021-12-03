import {
  AllowNull,
  BeforeBulkUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Validate,
} from "sequelize-typescript";
import { Optional } from "sequelize/types";
import CategoryPhone from "./categoryPhone.model";

import Department from "./department.model";
import Holder from "./holder.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";
import User from "./user.model";

@Table
export default class Category extends Model<
  DB.CategoryAttributes,
  DB.CreateAttributes<DB.CategoryAttributes>
> {
  @AllowNull(false)
  @Column(DataType.DATE)
  actDate: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  actKey: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  categoryKey: CategoryKey;

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

  @BelongsToMany(() => Phone, {
    through: { model: () => CategoryPhone, scope: { status: null } },
  })
  phones?: Phone[];

  @AllowNull(true)
  @Column(DataType.STRING)
  description?: string;

  @AllowNull(false)
  @Column(DataType.NUMBER)
  authorId: number;

  @BelongsTo(() => User)
  author?: User;
}
