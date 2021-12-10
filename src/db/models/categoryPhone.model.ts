import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Validate,
} from "sequelize-typescript";
import Category from "./category.model";

import Phone from "./phone.model";

@Table({ defaultScope: { where: { status: null } } })
export default class CategoryPhone extends Model<
  DB.CategoryPhoneAttributes,
  DB.CreateAttributes<DB.CategoryPhoneAttributes>
> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  // TODO: On Delete Cascade
  @ForeignKey(() => Category)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  categoryId: number;

  @ForeignKey(() => Phone)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneId: number;

  @AllowNull(true)
  @Validate({ isIn: [["create-pending", "delete-pending"]] })
  @Default(null)
  @Column(DataType.STRING)
  status?: CommitStatus | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  statusAt?: string;

  @BelongsTo(() => Category, { onDelete: "CASCADE" })
  category?: Category;

  @BelongsTo(() => Phone, { onDelete: "CASCADE" })
  phone?: Phone;
}
