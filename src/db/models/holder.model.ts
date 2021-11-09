import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
  HasOne,
  BelongsTo,
  BelongsToMany,
} from "sequelize-typescript";
import { Op, Optional } from "sequelize";
import Department from "./department.model";
import Holding from "./holding.model";
import HoldingPhone from "./holdingPhone.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";

@Table
export default class Holder extends Model<
  DB.HolderAttributes,
  DB.CreateAttributes<DB.HolderAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  middleName: string;

  @ForeignKey(() => Department)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  departmentId: number;

  @BelongsTo(() => Department)
  department: Department;

  static async getByPhones(ids: number[]) {
    const phoneHolderMap = new Map<number, Holder>();
    const holders = (
      await HoldingPhone.findAll({
        where: { phoneId: { [Op.in]: ids } },
        include: [{ model: Holding, include: [Holder] }],
        attributes: ["phoneId"],
      })
    ).forEach((holding) =>
      phoneHolderMap.set(holding.phoneId, holding.holding.holder)
    );

    return phoneHolderMap;
  }

  // @BelongsToMany(() =>  Phone, )
}
