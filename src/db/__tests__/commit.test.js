import dotenv from "dotenv";

dotenv.config();

import { init as initDb, close } from "../index";
import {
  Commit,
  convertChangesList,
  getChanges,
  getChangesById,
  getUpdater,
} from "../commit";
import Department from "../models/department.model";
import Phone from "../models/phone.model";
import Change from "../models/change.model";
import Holder from "../models/holder.model";

jest.setTimeout(10000);

describe("commit test", () => {
  let depId;
  let updater;
  let holderUpdater;
  let holderId;

  beforeAll(async () => {
    await initDb();
    const dep = await Department.create({ name: "before" }, { raw: true });
    const holder = await Holder.findOne({ raw: true });

    holderId = holder.id;
    depId = dep.id;

    updater = getUpdater("Department", depId, 1);
    holderUpdater = getUpdater("Holder", holderId, 1);
  });

  it("push", async (ok) => {
    await updater.push({ name: "after" });
    const changes = await getChangesById(1, "Department", depId);
    expect(changes).toStrictEqual({ name: "after" });

    ok();
  });

  it("multiple pushes", async (ok) => {
    await holderUpdater.push({ firstName: "foo" });
    await holderUpdater.push({ lastName: "owo" });

    let changes = await getChangesById(1, "Holder", holderId);
    expect(changes).toStrictEqual({ firstName: "foo", lastName: "owo" });

    await holderUpdater.commit();

    changes = await getChangesById(1, "Holder", holderId);
    expect(changes).toBeUndefined();

    const { firstName, lastName } = await Holder.findByPk(holderId, {
      raw: true,
    });
    expect({ firstName, lastName }).toStrictEqual({
      firstName: "foo",
      lastName: "owo",
    });

    ok();
  });

  it("clear", async (ok) => {
    await holderUpdater.push({ firstName: "foo", lastName: "owo" });
    await holderUpdater.clear("firstName");

    const { firstName, lastName } = await getChangesById(1, "Holder", holderId);
    expect({ firstName, lastName }).toStrictEqual({
      firstName: undefined,
      lastName: "owo",
    });

    await holderUpdater.clear();

    const changes = await getChangesById(1, "Holder", holderId);
    expect(changes).toBeUndefined();
    ok();
  });

  it("commit", async (ok) => {
    await updater.push({ name: "after" });
    await updater.commit();
    const dep = await Department.findByPk(depId, { raw: true });

    expect(dep.name).toBe("after");

    ok();
  });

  afterAll(async () => {
    close();
  });
});
