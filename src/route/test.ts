import Department from "@backend/db/models/department.model";
import Holder from "@backend/db/models/holder.model";
import Holding from "@backend/db/models/holding.model";
import Phone from "@backend/db/models/phone.model";
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import User from "@backend/db/models/user.model";
import { randomUUID } from "crypto";
import { Router } from "express";
import { sequelize } from "../db";

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

const router = Router();

export const fillTestDatabase = async (size: number = 100) => {
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
    "Ариша Козлова Юрьевна",
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

  const phonesData = mapGenerated(size, () => ({
    inventoryKey: randomUUID(),
    factoryKey: randomUUID(),

    accountingDate: randomDate().toString(),
    assemblyDate: randomDate().toString(),
    commissioningDate: randomDate().toString(),

    phoneModelId: getRandomItem(models).id,
    holderId: getRandomItem(holders).id,
  }));

  const phones = await Phone.bulkCreate(phonesData);
  const categories = Promise.all(
    mapGenerated(size - 5, () => {
      const phoneId = getRandomItem(phones).id;
      const date = randomDate();
      return PhoneCategory.bulkCreate(
        mapGenerated(Math.floor(Math.random() * 4), (i) => ({
          category: (i + 1).toString(),
          date: new Date(
            date.getFullYear() + i,
            date.getMonth(),
            date.getDay()
          ).toString(),
          phoneId,
        }))
      );
    })
  );

  const holdingData = mapGenerated(size - 10, () => {
    const randomHolders = getRandomItems(size - 10, holders);
    const randomPhones = getRandomItems(size - 10, phones);
    return {
      actKey: `#${Math.floor(10 + Math.random() * 100)}`,
      actDate: randomDate().toString(),
      holderId: getRandomItem(randomHolders).id,
      phoneId: getRandomItem(randomPhones).id,
    };
  });

  const holdings = await Holding.bulkCreate(holdingData);

  const user = await User.create({
    username: "admin",
    passwordHash: "123",
    role: "admin",
  });

  console.log("fill complete.");
};

router.get("/db/fill", async (req, res) => {
  await fillTestDatabase();
  res.send("filled.");
});

export default router;
