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
} from "sequelize-typescript";
import { getChanges, getChangesById } from "../commit";
import Change from "./change.model";

import Holder from "./holder.model";
import Holding from "./holding.model";
import PhoneCategory from "./phoneCategory.model";
import PhoneModel from "./phoneModel.model";

@Table
export default class Phone extends Model<
  Models.PhoneAttributes,
  OptionalId<Models.PhoneAttributes>
> {
  @AllowNull(false)
  @Column(DataType.STRING)
  inventoryKey: string;

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

  @BelongsTo(() => Holder)
  holder: Holder;

  @BelongsTo(() => PhoneModel)
  model: PhoneModel;

  @HasMany(() => PhoneCategory)
  categories: PhoneCategory[];

  @HasMany(() => Holding)
  holdings: Holding[];

  async getChanges(userId: number) {
    const changes = await getChangesById(userId, "Phone", this.id);
    return changes[this.id];
  }
}

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
