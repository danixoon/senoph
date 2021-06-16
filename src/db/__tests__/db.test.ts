import dotenv from "dotenv";
import { BotModel } from "@backend/db/models/Bot";
import { DialogModel } from "@backend/db/models/Dialog";
import { BotDbObject, TokenDbObject } from "@backend/graphql/generated";
import { db, init as initDb } from "@backend/db/index";
import { ObjectId } from "mongodb";
import { TokenModel } from "@backend/db/models/Token";
import { TokenStatusEnum } from "@backend/graphql/schemas/enums";
import { UserModel } from "@backend/db/models/User";
import { clearDb, getFreeTokens } from "@backend/db/queries";

dotenv.config();

jest.setTimeout(100000);

const tokenDoc = {
  anonId: "14617853",
  status: TokenStatusEnum.ACTIVE,
  token: "c48f5d2d83b76183e20fdf8ce6e9ad2603dff225748668b31bba617825ca2da1",
};

const createTestCollections = async () => {
  const dialog = await DialogModel.create({ time: Date.now() });
  const token = await TokenModel.create(tokenDoc);
  const bot = await BotModel.create({
    dialogId: dialog.id,
    tokenId: token.id,
  });
  return { dialog, token, bot };
};

describe("db test", () => {
  beforeAll(async () => {
    await initDb(process.env.TEST_MONGO_URI);
  });

  beforeEach(() => clearDb());

  it("populate", async () => {
    const { token } = await createTestCollections();
    const botDocs = (await BotModel.findOne()
      .populate("tokenId")
      .exec()) as Backend.DB.WithPopulated<BotDbObject, "tokenId", TokenDbObject>;
    expect(botDocs.tokenId.token).toBe(token.token);
  });
  it("max bots", async () => {
    const { dialog, token } = await createTestCollections();
    // Ошибка при создании бота с токеном, который уже присвоен другому боту
    await expect(
      BotModel.create({
        dialogId: dialog.id,
        tokenId: token.id,
      })
    ).rejects.toBeDefined();

    const secondToken = await TokenModel.create({
      anonId: "14740253",
      token: "039eeba7d7cf761fac244e2ab4fd77aab3a555c57b691da78a2a385d1740366f",
      status: TokenStatusEnum.ACTIVE,
    });

    // Возможно создать второго бота с новым токеном
    await expect(
      BotModel.create({
        dialogId: dialog.id,
        tokenId: secondToken.id,
      })
    ).resolves.toBeDefined();

    const thirdToken = await TokenModel.create({
      anonId: "14740341",
      token: "44fb0e4d0b7f8f0dee2c111fefae497221b54f9b618663e696c12faeca8a0eb9",
      status: TokenStatusEnum.ACTIVE,
    });

    // Невозможно создать бота, если в диалоге уже два бота
    await expect(
      BotModel.create({ dialogId: dialog.id, tokenId: thirdToken.id })
    ).rejects.toBeDefined();
  });
  it("free token fetching", async () => {
    const { dialog, token } = await createTestCollections();
    const thirdToken = await TokenModel.create({
      anonId: "14740341",
      token: "44fb0e4d0b7f8f0dee2c111fefae497221b54f9b618663e696c12faeca8a0eb9",
      status: TokenStatusEnum.ACTIVE,
    });
    const secondToken = await TokenModel.create({
      anonId: "14740253",
      token: "039eeba7d7cf761fac244e2ab4fd77aab3a555c57b691da78a2a385d1740366f",
      status: TokenStatusEnum.ACTIVE,
    });

    const tokens = await getFreeTokens(2);

    expect(tokens).not.toBeNull();
  });
});
