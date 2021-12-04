import { logger } from "@backend/utils/index";
import { Sequelize } from "sequelize";
import { QueryTypes } from "sequelize";
import { Op } from "sequelize";
import {
  AllowNull,
  ForeignKey,
  Column,
  Model,
  Table,
  DataType,
  BelongsToMany,
  BelongsTo,
  HasOne,
  HasMany,
  Default,
  DefaultScope,
  setHooks,
  AfterCreate,
  AfterBulkCreate,
  Validate,
  Unique,
  Scopes,
  BeforeUpdate,
  BeforeCreate,
  BeforeBulkUpdate,
} from "sequelize-typescript";
import { sequelize } from "..";

import { getChanges, getChangesById } from "../commit";
import Change from "./change.model";
import Commit from "./commit.model";

import Holder from "./holder.model";
import Holding from "./holding.model";
import HoldingPhone from "./holdingPhone.model";
import Category from "./category.model";
import PhoneModel from "./phoneModel.model";
import User from "./user.model";
import CategoryPhone from "./categoryPhone.model";

@Table({
  scopes: {
    commit: {
      where: {
        status: {
          [Op.not]: null,
        },
      },
      include: [
        {
          model: PhoneModel,
          as: "model",
        },
      ],
    },
  },
  defaultScope: {
    where: {
      status: null,
    }, 
  },
})
export default class Phone extends Model<
  DB.PhoneAttributes,
  DB.CreateAttributes<DB.PhoneAttributes>
> { 
  @Unique
  @AllowNull(true)
  @Column(DataType.STRING)
  inventoryKey?: string;

  @Unique
  @AllowNull(true)
  @Column(DataType.STRING)
  factoryKey?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  accountingDate: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  assemblyDate: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  commissioningDate: string;

  @ForeignKey(() => PhoneModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  phoneModelId: number;

  @AllowNull(true)
  @Validate({ isIn: [["create-pending", "delete-pending"]] })
  @Default("create-pending")
  @Column(DataType.STRING)
  status?: CommitStatus | null;

  //TODO: Auto set status
  @AllowNull(true)
  @Column(DataType.DATE)
  statusAt?: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  authorId: number;

  @BelongsToMany(() => Holding, () => HoldingPhone)
  holdings: Holding[];

  @BelongsToMany(() => Category, () => CategoryPhone)
  categories: Category[];

  @BelongsTo(() => PhoneModel)
  model: PhoneModel;

  @BeforeBulkUpdate
  static onBeforeUpdate(args: any) {
    args.fields.push("statusAt");
    args.attributes.statusAt = new Date().toISOString();
  }

  // static async withHolders(phones: Phone[]) {
  //   const holders = await Holder.getByPhones(phones.map((phone) => phone.id));
  //   const mappedPhones: Api.Models.Phone[] = [];
  //   phones.forEach((phone) => {
  //     const holder = holders.get(phone.id);
  //     const p: Api.Models.Phone = {
  //       ...phone.toJSON(),
  //       holder: holder?.toJSON(),
  //     };
  //     mappedPhones.push(p);
  //   });

  //   return mappedPhones;
  // }

  async getChanges(userId: number) {
    const changes = await getChangesById(userId, "phone", this.id);
    return changes;
  }
}
