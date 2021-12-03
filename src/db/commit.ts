import { Model } from "sequelize-typescript";
import { ModelDefined, ModelStatic, Op } from "sequelize";
import Change from "./models/change.model";
import Department from "./models/department.model";
import Holder from "./models/holder.model";
import Holding from "./models/holding.model";
import Phone from "./models/phone.model";
import CommitModel from "./models/commit.model";
import Category from "./models/category.model";
// import { models } from "./models";
import { logger } from "../utils";
import { getModel } from ".";

// export const bindHooks = (
//   name: CommitTargetName,
//   target: ModelDefined<any, any>
// ) => {
//   target.addHook("beforeBulkCreate", (instances, options) => {
//     const { context } = options;
//     if (!context) {
//       logger.info("Создание без коммита", {
//         service: "db",
//         payload: { target: name },
//       });
//       return;
//     }

//     const commits: DB.CommitAttributes[] = instances.map((instance) => ({
//       action: "create",
//       targetId: (instance as any).id,
//       target: name,
//       userId: context.userId,
//     }));

//     CommitModel.bulkCreate(commits);
//   });
// };

const mapObject = (
  obj: any,
  level: number,
  fn: (key: any, value: any) => any
) => {
  const deepMap: (source: any, path: string[]) => any = (
    source: any,
    path: string[] = []
  ) => {
    if (path.length === level) return fn(path.join("."), source);
    for (const k in source) {
      return deepMap(source[k], [...path, k]);
    }
    return source;
  };

  return deepMap(obj, []);
};

const setByPath = (obj: any, key: string, value: any) => {
  const path = key.split(".");
  const step: (obj: any, path: string[]) => any = (obj, path) => {
    if (path.length === 0) return obj;

    const prop = path.shift() as string;
    const o =
      path.length === 0
        ? value
        : typeof obj[prop] === "undefined"
        ? {}
        : obj[prop];

    obj[prop] = o;

    return step(o, path);
  };

  return step(obj, path);
};

const promisifyObject = async <T>(
  obj: T,
  level: number,
  fn: (key: string, value: T[keyof T]) => Promise<any> = async (k, v) => v
) => {
  const promises = new Map<string, Promise<any>>();
  let mapped = mapObject(obj, level, (key, value) => {
    const promise = fn(key, value);

    promises.set(key, promise);

    return promise;
  });

  const resolved = await Promise.all(
    Array.from(promises.entries()).map(async ([key, promise]) => {
      return [key, await promise];
    })
  );

  const result = {} as any;
  // console.log(resolved);

  for (const [key, value] of resolved) {
    setByPath(result, key, value);
    // console.log(value);
  }

  return result;
};

// type ModelMap = {
//   Phone: typeof Phone;
//   PhoneCategory: typeof PhoneCategory;
//   Department: typeof Department;
//   Holder: typeof Holder;
//   Holding: typeof Holding;
// };

export class Commit {
  // userId: number;
  // target: ChangesTargetName;
  // targetId: number;
  // changes: Models.ChangeAttributes[];
  // targetId: number;
  target: ChangesTargetName;
  userId: number;

  constructor(
    target: ChangesTargetName,
    // targetId: number,
    userId: number
    // changes: Models.ChangeAttributes[] = []
  ) {
    // this.changes = changes;
    this.target = target;
    // this.targetId = targetId;
    this.userId = userId;
  }

  undo = async () => {};

  push = async <T>(targetId: number, changes: T) => {
    const changesList: DB.CreateAttributes<DB.ChangeAttributes>[] = [];
    for (const key in changes) {
      let type: ChangedDataType = "string";
      if (key.endsWith("Date")) type = "date";
      if (key.endsWith("Id")) type = "number";

      const change: DB.CreateAttributes<DB.ChangeAttributes> = {
        targetId,
        userId: this.userId,
        target: this.target,
        column: key,
        type,
        value: (changes[key] as any).toString(),
      };

      changesList.push(change);
    }

    // this.changes = [...this.changes, ...changesList];

    let updates = {} as Record<string, Record<string, Record<string, any>>>;
    // await Change.bulkCreate(this.changes);
    for (const change of changesList) {
      const tableUpdates = updates[change.target] ?? {};
      const targetIdUpdates = tableUpdates[change.targetId] ?? {};
      if (targetIdUpdates[change.column] != undefined)
        throw new Error("Same Id across two or more updates");
      const targetColumnUpdates = change.value;

      tableUpdates[change.targetId] = targetIdUpdates;
      targetIdUpdates[change.column] = targetColumnUpdates;

      updates[change.target] = tableUpdates;
    }

    const result = await promisifyObject(updates, 2, (key, value) => {
      const elements = key.split(".");

      const [table, id] = elements;
      const model = getModel(table);

      return model.update({ ...value }, { where: { id } });
    });

    return result;
  };

  static create = <T>(
    target: ChangesTargetName,
    userId: number
    // changes: T
  ) => {
    return new Commit(target, userId);
  };
}

// type ClassType<T extends { new (...p: any[]): any }> = T extends {
//   new (...p: any[]): infer R;
// }
//   ? R
//   : never;

export const getChanges = async <T extends ChangesTargetName>(
  userId: number,
  target: T
) => {
  const where = { target, userId } as any;

  const changes = await Change.findAll({
    where,
    raw: true,
  });
  // type Model = typeof models[keyof typeof models extends T ? T : never];
  // TODO: Выразить аттрибуты

  // const grouped = changes.reduce(
  //   (a, v) => ({ ...a, [v.targetId]: [...(a.targetId ?? []), v] }),
  //   {} as any
  // ) as Record<number, Change[]>;

  const result = convertChangesList(changes);

  return result;
};

export const getChangesById = async <T extends ChangesTargetName>(
  userId: number,
  target: T,
  targetId: number
) => {
  const changes = await getChanges<T>(userId, target);
  return changes[targetId];
};

const getChangesList: (
  target: ChangesTargetName,
  targetId: number,
  userId: number,
  changes: any
) => DB.CreateAttributes<DB.ChangeAttributes>[] = (
  target,
  targetId,
  userId,
  changes
) => {
  const changesList: DB.CreateAttributes<DB.ChangeAttributes>[] = [];
  for (const key in changes) {
    let type: ChangedDataType = "string";
    if (key.endsWith("Date")) type = "date";
    if (key.endsWith("Id")) type = "number";

    const change: DB.CreateAttributes<DB.ChangeAttributes> = {
      targetId,
      userId,
      target,
      column: key,
      type,
      value: (changes[key] as any).toString(),
    };

    changesList.push(change);
  }
  return changesList;
};

export const convertChangesList = (changes: DB.ChangeAttributes[]) => {
  return changes.reduce((a, v) => {
    a[v.targetId] = {
      ...(a[v.targetId] ?? {}),
      [v.column]: v.value,
      createdAt: v.createdAt,
    };
    return a;
  }, {} as { [key: number]: any });
};

// const createCommit =
export const getUpdater = <T extends ChangesTargetName>(
  target: T,
  targetId: number,
  userId: number
) => {
  const push = async (changes: any) => {
    const changesList = getChangesList(target, targetId, userId, changes);
    const columns = Object.keys(changes);
    await Change.destroy({
      where: { target, targetId, userId, column: { [Op.in]: columns } },
    });
    await Change.bulkCreate(changesList);
  };
  const clear = async (...columns: string[]) => {
    const where = { target, userId, targetId } as any;
    if (columns.length > 0) where.column = { [Op.in]: columns };
    await Change.destroy({
      where,
    });
  };

  const clearAll = async () => {
    const where = { target, userId, targetId } as any;
    await Change.destroy({
      where,
    });
  };

  const commit = async () => {
    const changesList = await Change.findAll({
      where: { targetId, target, userId },
      raw: true,
    });

    const changes = convertChangesList(changesList);

    const upperCase = (str: string) => {
      return str[0].toUpperCase() + str.slice(1);
    };

    // TODO: Any typing
    const model = getModel(upperCase(target));
    console.log("whjat");
    await model.update(changes[targetId], {
      where: { id: targetId },
    });
    await clear();
  };
  return {
    push,
    clear,
    clearAll,
    commit,
  };
};
