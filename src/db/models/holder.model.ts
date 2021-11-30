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
  HasMany,
} from "sequelize-typescript";
import { Op, Optional, QueryTypes } from "sequelize";
import Department from "./department.model";
import Holding from "./holding.model";
import HoldingPhone from "./holdingPhone.model";
import Phone from "./phone.model";
import PhoneType from "./phoneType.model";
import { sequelize } from "..";

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

  // @HasMany(() => Holding)
  // holdings: Holding[];

  static async getHolderIds(ids?: number[]) {
    const [values] = await sequelize.query<{ id: number }[]>(
      `SELECT
      holder.id as holderId,
      MAX(holding.orderDate) as dt
    FROM
      Phones phone
      INNER JOIN PhoneModels phoneModel ON phoneModel.id = phone.phoneModelId
      INNER JOIN HoldingPhones holdingPhone ON holdingPhone.phoneId = phone.id
      INNER JOIN Holdings holding ON holding.id = holdingPhone.holdingId
      INNER JOIN Holders holder ON holder.id = holding.holderId
      INNER JOIN Departments dep ON dep.id = holder.departmentId
    GROUP BY
      phone.id, holder.id ${ids ? "HAVING phone.id IN (:ids)" : ""} `,
      { replacements: { ids }, type: QueryTypes.SELECT }
    );

    const holderIds = values.map((v) => v.id);

    return Holder.findAll({ where: { id: { [Op.in]: holderIds } } });
  }

  static async getByPhones(ids: number[]) {
    const phoneHolderMap = new Map<number, Holder>();
    // const departmentFilter = departmentId ? { where: { departmentId } } : {};
    const holders = await HoldingPhone.findAll({
      where: { phoneId: { [Op.in]: ids } },
      include: [
        {
          model: Holding,
          include: [
            {
              model: Holder,
              // ...departmentFilter,
              order: ["orderDate", "DESC"],
            },
          ],
        },
      ],
      attributes: ["phoneId"],
    });

    holders.forEach(
      (holding) =>
        holding.holding?.holder &&
        phoneHolderMap.set(holding.phoneId, holding.holding?.holder)
    );

    return phoneHolderMap;
  }

  // @BelongsToMany(() =>  Phone, )
}
