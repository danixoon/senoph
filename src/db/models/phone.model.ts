import { logger } from "@backend/utils/index";
import { Sequelize } from "sequelize";
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

import { getChanges, getChangesById } from "../commit";
import Change from "./change.model";
import Commit from "./commit.model";

import Holder from "./holder.model";
import Holding from "./holding.model";
import PhoneCategory from "./phoneCategory.model";
import PhoneModel from "./phoneModel.model";
import User from "./user.model";

// class CommitedModel<T, K> extends Model<T, K> {
//   @ForeignKey(() => Commit)
//   @AllowNull(true)
//   @Column(DataType.INTEGER)
//   commitId: number | null;

//   @BelongsTo(() => Commit)
//   commit: Commit | null;

//   onInit = () => {
//     // bindHooks()
//   };
// }

// CommitedModel.addHook("beforeBulkCreate", )

// @DefaultScope(() => ({
//   ,
// }))

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
        {
          model: Holder,
          as: "holder",
        },
        // {
        //   model: PhoneModel,
        // },
        // {
        //   model: PhoneModel,
        // },
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
  @AllowNull(false)
  @Column(DataType.STRING)
  inventoryKey: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  factoryKey: string;

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

  @ForeignKey(() => Holder)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  holderId: number;

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

  @BelongsTo(() => Holder)
  holder: Holder;

  @BelongsTo(() => PhoneModel)
  model: PhoneModel;

  @HasMany(() => PhoneCategory)
  categories: PhoneCategory[];

  @HasMany(() => Holding)
  holdings: Holding[];

  @BeforeBulkUpdate
  static onBeforeUpdate(args: any) {
    args.fields.push("statusAt");
    args.attributes.statusAt = new Date().toISOString();
  }

  // getStatus = () => {
  //   const status: CommitStatus = this.isCommited
  //     ? this.isSoftDeleted()
  //       ? "deleted"
  //       : "idle"
  //     : "commited";

  //   return status;
  // };

  async getChanges(userId: number) {
    const changes = await getChangesById(userId, "phone", this.id);
    return changes;
  }
}

// bindHooks("phone", Phone as any);

// Phone.beforeBulkCreate("hey", (inst) => {});

// setHooks(Phone, [{ hookType: "afterCreate", methodName: "onCreate" }]);
// export default {
//   create: async (phone: WithoutId<Database.Phone>) =>
//     insertObject(pool.request(), "Phone", phone),

//   search: async (filter: ApiRequest.FetchPhones) => {
//     const req = pool.request();
//     const cond = {
//       category:
//         "@category = (SELECT TOP 1 [category] FROM [PhoneCategory] WHERE [phoneId] = p.[id] ORDER BY [date] DESC)",
//       modelId: "@modelId = p.[modelId]",
//       phoneTypeId: `@phoneTypeId IN (SELECT [phoneTypeId] FROM [Model] m WHERE p.[modelId] = m.[id] ${
//         filter.modelId ? "AND m.[id] = @modelId" : ""
//       })`,
//     };

//     let activeCond = [];
//     for (const k in cond) {
//       const value = (filter as any)[k];
//       if (typeof value !== "undefined") {
//         activeCond.push((cond as any)[k]);
//         req.input(k, value);
//       }
//     }

//     const query = `SELECT * FROM [Phone] p ${
//       activeCond.length > 0 ? ` WHERE ${activeCond.join(" AND ")}` : ""
//     }`;

//     const result = await req.query(query);

//     return prepareResponse(result.recordset) as ApiResponse.FetchPhones;
//   },

//   getTypes: async () => {
//     const result = await pool.request().query("SELECT * FROM [PhoneType]");
//     return prepareResponse<ApiResponse.PhoneType>(result.recordset);
//   },
// };
