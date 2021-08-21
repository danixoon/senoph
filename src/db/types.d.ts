declare type WithId<T, I = number> = OptionalId<T, I>;
declare type WithoutId<T> = Omit<T, "id">;
declare type OptionalId<T, I = number> = WithoutId<T> & { id?: I };
declare type RequiredId<T, I = number> = WithoutId<T> & { id: I };
declare type Role = "admin" | "user" | "unknown";
declare type ChangesTargetName =
  | "department"
  | "holder"
  | "holding"
  | "phone"
  | "phoneCategory";

declare type CommitTargetName = keyof Pick<
  Api.ModelMap,
  "phone" | "phoneCategory" | "phoneModel" | "holding"
>;

declare type ChangedDataType = "string" | "date" | "number";
declare type CommitActionType = "approve" | "decline";
declare type CommitStatus = "delete-pending" | "create-pending";

declare type WithCommit = {
  status?: CommitStatus | null;
  statusAt?: string;
};

// declare type WithCommitStatus = { status: CommitStatus };
declare type WithAuthor = { authorId: number };

// type SeqModel<A, B> = import("sequelize").Model<A, B>;

declare type HookContext = { context?: { userId: number } };

// declare type Attributify<T> = T extends SeqModel<infer A, infer _> ? A : never;

declare namespace DB {
  type CreateAttributes<T> = Omit<OptionalId<T>, "createdAt">;
  type Attributes<T> = WithId<T> & { createdAt?: string };

  type PhoneTypeAttributes = Attributes<{
    name: string;
  }>;

  type PhoneModelAttributes = Attributes<{
    name: string;
    accountingDate: string;
    phoneTypeId: number;
  }>;

  type PhoneCategoryAttributes = Attributes<{
    date: string;
    category: string;
    phoneId: number;
  }>;

  type HoldingAttributes = Attributes<{
    actDate: string;
    actKey: string;
    holderId: number;
    phoneId: number;
  }>;

  type HolderAttributes = Attributes<{
    firstName: string;
    lastName: string;
    middleName: string;
    departmentId: number;
  }>;

  type DepartmentAttributes = Attributes<{
    name: string;
  }>;

  type PhoneAttributes = Attributes<{
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
  }> &
    WithCommit &
    WithAuthor;

  type UserAttributes = Attributes<{
    username: string;
    passwordHash: string;
    role: Role;
  }>;

  type ChangeAttributes = Attributes<{
    target: ChangesTargetName;
    targetId: number;
    column: string;
    value: string;
    type: ChangedDataType;
    userId: number;
  }>;

  type CommitAttributes = Attributes<{
    target: CommitTargetName;
    targetId: number;
    action: CommitActionType;
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
