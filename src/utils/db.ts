import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import Phone from "@backend/db/models/phone.model";
import Category from "@backend/db/models/category.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import User from "@backend/db/models/user.model";
import { v4 as uuid } from "uuid";
import { Op, fn, WhereOperators, WhereOptions } from "sequelize";
import sequelize from "sequelize";
import { Fn } from "sequelize/types/lib/utils";
import CategoryPhone from "@backend/db/models/categoryPhone.model";

// import { sequelize } from "../db";

interface AddFilter<T> {}

export interface Filter<T> {
  add: (
    key: keyof T,
    ...conditions: (keyof WhereOperators | WhereOperators)[]
  ) => this;
  addWith: (
    key: keyof T,
    value: any,
    ...conditions: (keyof WhereOperators | WhereOperators)[]
  ) => this;
}

export class WhereField<T> {
  private filter: WhereFilter<T>;

  private key: keyof T;

  constructor(filter: WhereFilter<T>, key: keyof T) {
    this.filter = filter;
    this.key = key;
  }

  optional = (op: keyof WhereOperators, value: any) => {
    if (typeof value !== "undefined") {
      if (!this.filter.whereMap[this.key])
        this.filter.whereMap[this.key] = { [op]: value };
      else this.filter.whereMap[this.key][op] = value;
    }
    return this;
  };
}
type WhereType<T> = Record<keyof T, Partial<Record<keyof WhereOperators, any>>>;
export class WhereFilter<T> {
  public whereMap: WhereType<T> = {} as WhereType<T>;
  on: (key: keyof T) => WhereField<T> = (key) => {
    return new WhereField(this, key);
  };

  private fns: sequelize.Utils.Where[] = [];

  fn = (where: sequelize.Utils.Where) => {
    this.fns.push(where);
  };

  public set where(value: undefined | typeof this.whereMap) {
    this.whereMap = value ?? ({} as any);
  }

  public get where(): undefined | typeof this.whereMap {
    let where =
      Object.keys(this.whereMap).length === 0 ? undefined : this.whereMap;
    if (this.fns.length > 0) {
      where = where
        ? ({ [Op.and]: [...this.fns, where] } as any)
        : { [Op.and]: [...this.fns] };
    }

    return where;
  }
}

export class Filter<T extends object = any> {
  added: [symbol | string | number, any][] = [];
  source: T;
  private conditions: Partial<Record<keyof T, any>> = {};
  constructor(source: T) {
    this.source = source;
  }

  or = (filter: (filter: Filter) => Filter) => {
    const filtered = filter(new Filter(this.source));
    const value = Object.entries(filtered.where).map(([k, e]) => ({ [k]: e }));

    if (value.length !== 0) {
      this.conditions = {
        ...this.conditions,
        [Op.or]: value,
      };

      this.added.push([Op.or, value]);
    }

    return this;
  };

  addWith = (
    key: keyof T,
    value: any,
    ...conditions: (keyof WhereOperators | WhereOperators)[]
  ) => {
    if (value === undefined) return this;

    const f = new Filter({ [key]: value });
    f.add(key as string, ...conditions);

    this.conditions = { ...this.conditions, ...f.where };
    this.added = [...this.added, ...f.added];

    return this;
  };

  add = (
    key: keyof T,
    ...conditions: (keyof WhereOperators | WhereOperators)[]
  ) => {
    const target = this.source[key];
    if (conditions.length === 0 && typeof target !== "undefined") {
      this.conditions = { ...this.conditions, [key]: target };
      this.added.push([key, target]);
    } else
      for (const condition of conditions) {
        if (typeof target !== "undefined") {
          const value =
            typeof condition === "symbol"
              ? {
                  ...(this.conditions[key] ?? {}),
                  [condition]: target,
                }
              : condition;

          this.conditions = {
            ...this.conditions,
            [key]: value,
          };

          this.added.push([key, value]);
        }
      }

    return this;
  };
  get where() {
    return this.conditions as WhereOptions<T>;
  }
}

const randomDate = (from = 2000, length = 15) =>
  new Date(
    from + Math.floor(Math.random() * length),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28)
  );

const getRandomItem = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const getRandomItems = <T>(count: number, items: T[]) =>
  [...items].sort(() => Math.sign(Math.random() - 0.5)).slice(-count);

const mapGenerated = <T = any>(size: number, f: (i: number) => T) =>
  new Array(size).fill(0).map((_, i) => f(i));

export const fillProdDatabase = async () => {
  const adminUser = await User.findOne({ where: { role: "admin" } });
  if (adminUser) return;
  await User.create({
    name: "Администратор",
    username: "admin",
    passwordHash:
      "$2b$13$PwLX48c7HTCmRfqbsd8pq.f6BCkNYnQcyfYg95hx7p2jgLCd2jkqC",
    role: "admin",
  });
};

export const fillDevDatabase = async (full?: boolean, size: number = 150) => {
  const adminUser = await User.findOne({ where: { role: "admin" } });
  if (adminUser) return;
  const user = await User.create({
    name: "Админушка",
    username: "admin",
    passwordHash:
      "$2b$13$PwLX48c7HTCmRfqbsd8pq.f6BCkNYnQcyfYg95hx7p2jgLCd2jkqC",
    role: "admin",
  });

  if (!full) return;

  const depsNames = [
    "Кардиологическое отделение",
    "Отделение информационных технологий",
    "Инфекционное отделение",
    "Медицинская часть",
    "Отделение правового обеспечения",
    "Отделение функциональной диагностики",
    "Отеделение гипербарической оксигенации",
    "ЦИТАР",
    "Отделение сосудистой хирургии",
    "Хирургическое отделение",
    "Гинекологическое отделение",
    "Травматологическое отделение",
    "Нейрохирургическое отделение",
    "Физиотерапевтическое отделение",
  ];
  const deps = await Department.bulkCreate(
    depsNames.map((dep) => ({ name: dep }))
  );

  const holdersNames = [
    "Козлова Ариша Юрьевна",
    "Антонов Иван Михайлович",
    "Афанасьева Валерия Андреевна",
    "Афанасьева Ника Львовна",
    "Большаков Ярослав Макарович",
    "Воробьёва Юльяна Андреевна",
    "Голикова Надежда Михайловна",
    "Гончаров Владимир Никитич",
    "Громов Тимофей Николаевич",
    "Давыдова Юлия Викторовна",
    "Дмитриев Роман Андреевич",
    "Ермаков Максим Никитич",
    "Капустина Анастасия Макаровна",
    "Королёв Герман Никитич",
    "Логинова Елизавета Тимофеевна",
  ];

  const holders = await Holder.bulkCreate(
    holdersNames.map((name) => {
      const [lastName, firstName, middleName] = name.split(" ");
      return {
        firstName,
        lastName,
        middleName,
        departmentId: getRandomItem(deps).id,
      };
    })
  );

  const phoneTypes = await PhoneType.bulkCreate(
    ["СС", "ТА", "БТА", "IP", "РС"].map((type) => ({ name: type }))
  );

  const modelsNames = [
    "Allure 130",
    "Altlinks FS29230GE2-A",
    "BBK BKT-203RU",
    "Bremier Sydney",
    "Coguar CPS160",
    "Euroset 2005",
    "Euroset 2015",
    "Euroset 801",
    "Euroset 805",
    "Euroset 815",
    "Euroset 821",
    "Flaver Flims",
    "Florida, RT",
    "Gigaset 5005",
    "Gigaset 502U",
    "Gigaset A160",
    "Gigaset AS16H",
    "Gigaset DA100",
    "Gigaset DA310",
    "Gigaset DA710",
    "Harvest HT-4b",
    "LG Ericson LKA-200",
    "LG GS-472H",
    "LG GS5140",
    "LG Nortel LDP-7008D",
    "LG Nortel LDP-7024D",
    "LG Nortel LKA-220C",
    "Panasonic KX-T2335",
    "Panasonic KX-T2365",
    "Panasonic KX-TC1501B",
    "Panasonic KX-TCD951RUB",
    "Panasonic KX-TS10MX-W",
    "Panasonic KX-TS2350RU",
    "Panasonic KX-TS2363RUW",
    "Post FeTaP 751-1",
    "Ritmix RT-003",
    "Siemens (Цифровой)",
    "Sony SPP-L338",
    "TA Vanguard",
    "Texet TX-214",
    "Varix S 5/2",
    "Voxtel Breeze LCD",
    "Вектор ST-545/01",
    "Мультиком KA-210",
    "Мультиком KTA-103",
    "Ритм TA-201",
    "Телур-20",
    "Телефон 73",
    "Телефон 75",
  ];
  const models = await PhoneModel.bulkCreate(
    modelsNames.map((model) => ({
      name: model,
      accountingDate: randomDate().toString(),
      phoneTypeId: getRandomItem(phoneTypes).id,
    }))
  );


  // return;

  const phonesData = mapGenerated(size, () => ({
    inventoryKey: uuid(),
    factoryKey: uuid(),

    accountingDate: randomDate().toString(),
    assemblyDate: randomDate().toString(),
    commissioningDate: randomDate().toString(),

    phoneModelId: getRandomItem(models).id,
    authorId: user.id,
    status:
      Math.random() > 0.5
        ? null
        : Math.random() > 0.5
        ? ("create-pending" as const)
        : ("delete-pending" as const),
  }));

  const phones = await Phone.bulkCreate(phonesData);
  const holdings = await Holding.bulkCreate(
    mapGenerated(Math.floor(size / 4), (i) => {
      const holding = {
        holderId: getRandomItem(holders).id,
        orderUrl: "sample.pdf",
        authorId: user.id,
        departmentId: getRandomItem(deps).id,
        orderKey: `${i}-${Math.floor(10 + Math.random() * 200)}`,
        orderDate:
          // Сегодня и -10 лет
          new Date(
            Math.floor(
              Date.now() - 1000 * 60 * 60 * 24 * 30 * 12 * 10 * Math.random()
            )
          ).toISOString(),
        reasonId: "movement" as const,
        status: null,
      };
      return holding;
    })
  );

  const holdingPhones: DB.HoldingPhoneAttributes[] = [];

  for (const holding of holdings) {
    holdingPhones.push(
      ...getRandomItems(Math.floor(phones.length / 20), phones).map(
        (phone) => ({
          phoneId: phone.id,
          holdingId: holding.id,
        })
      )
    );
  }

  await HoldingPhone.bulkCreate(holdingPhones);

  const category = await Category.create({
    categoryKey: "1",
    actDate: randomDate().toISOString(),
    actKey: (100 + Math.floor(Math.random() * 200)).toString(),
    authorId: user.id,
    actUrl: "test.pdf",
    status: null,
  });

  const categoryPhones = await CategoryPhone.bulkCreate(
    phones.map((phone) => ({ phoneId: phone.id, categoryId: category.id }))
  );
};
