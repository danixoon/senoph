declare type WithId<T> = OptionalId<T>;
declare type WithoutId<T> = Omit<T, "id">;
declare type OptionalId<T> = WithoutId<T> & { id?: number };
declare type RequiredId<T> = WithoutId<T> & { id: number };
declare type Role = "admin" | "user" | "unknown";
declare type ChangesTargetName =
  | "Department"
  | "Holder"
  | "Holding"
  | "Phone"
  | "PhoneCategory";
declare type ChangedDataType = "string" | "date" | "number";
declare type Attributify<T> = {
  [K in keyof T]: T[K] extends import("sequelize").Model<infer A>
    ? A
    : Attributify<T[K]>;
};

declare namespace Models {
  type PhoneTypeAttributes = WithId<{
    name: string;
  }>;

  type PhoneModelAttributes = WithId<{
    name: string;
    accountingDate: string;
    phoneTypeId: number;
  }>;

  type PhoneCategoryAttributes = WithId<{
    date: string;
    category: string;
    phoneId: number;
  }>;

  type HoldingAttributes = WithId<{
    actDate: string;
    actKey: string;
    holderId: number;
    phoneId: number;
  }>;

  type HolderAttributes = WithId<{
    firstName: string;
    lastName: string;
    middleName: string;
    departmentId: number;
  }>;

  type DepartmentAttributes = WithId<{
    name: string;
  }>;

  type PhoneAttributes = WithId<{
    inventoryKey: string;
    factoryKey: string;

    accountingDate: string;
    assemblyDate: string;
    commissioningDate: string;

    phoneModelId: number;
    holderId: number;

    holder?: HolderAttributes;
    model?: PhoneModelAttributes;
    categories?: PhoneCategoryAttributes[];
    holdings?: HoldingAttributes[];
  }>;

  type UserAttributes = WithId<{
    username: string;
    passwordHash: string;
    role: Role;
  }>;

  type ChangeAttributes = WithId<{
    target: ChangesTargetName;
    targetId: number;
    column: string;
    value: string;
    type: ChangedDataType;
    userId: number;
  }>;
}

// declare namespace Database {
//   type User = import("@backend/db/models/user.model").UserAttribues;
//   type PhoneType =
//     import("@backend/db/models/phoneType.model").PhoneTypeAttributes;
//   type PhoneModel =
//     import("@backend/db/models/phoneModel.model").PhoneModelAttributes;
//   type PhoneCategory =
//     import("@backend/db/models/phoneCategory.model").PhoneCategoryAttribues;
//   type Holding = import("@backend/db/models/holding.model").HoldingAttributes;
//   type Holder = import("@backend/db/models/holder.model").HolderAttributes;
//   type Department =
//     import("@backend/db/models/department.model").DepartmentAttributes;
//   type Phone = import("@backend/db/models/phone.model").PhoneAttributes;
// }
