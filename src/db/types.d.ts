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
  | "category";

declare type CommitTargetName = keyof Pick<
  Api.ModelMap,
  "phone" | "category" | "phoneModel" | "holding"
>;

declare type ChangedDataType = "string" | "date" | "number";
declare type CommitActionType = "approve" | "decline";
declare type CommitStatus = "delete-pending" | "create-pending" | null;
declare type HoldingReason =
  | "dismissal"
  | "movement"
  | "write-off"
  | "other"
  | "order";

declare type CategoryKey = "1" | "2" | "3" | "4";

declare type WithCommit = {
  status?: CommitStatus | null;
  statusAt?: string;
  statusId?: number | null;
};

// declare type WithCommitStatus = { status: CommitStatus };
declare type WithAuthor = { authorId: number; author?: DB.UserAttributes };

// type SeqModel<A, B> = import("sequelize").Model<A, B>;

declare type HookContext = { context?: { userId: number } };

// declare type Attributify<T> = T extends SeqModel<infer A, infer _> ? A : never;

declare namespace DB {
  type PhoneModelDetailType = "preciousMetal";
  type CreateAttributes<T> = Omit<OptionalId<T>, "createdAt">;
  type Attributes<T> = WithId<T> & { createdAt?: string };

  type PhoneTypeAttributes = Attributes<{
    name: string;
    description?: string;
    lifespan?: number;
  }>;

  type PhoneModelAttributes = Attributes<{
    name: string;

    phoneTypeId: number;
    phoneType?: PhoneTypeAttributes;
    description?: string;

    details?: PhoneModelDetailAttributes[];
  }>;

  type PhoneModelDetailAttributes = Attributes<{
    name: string;
    type: PhoneModelDetailType;

    amount: number;
    units: string;

    modelId: number;
    phoneModel?: DB.PhoneModelAttributes;
  }>;

  type CategoryAttributes = Attributes<{
    categoryKey: CategoryKey;
    actDate: string;
    actKey: string;
    actUrl: string;
    description?: string;
    phones?: PhoneAttributes[];
  }> &
    WithCommit &
    WithAuthor;

  type CategoryPhoneAttributes = Attributes<{
    categoryId: number;
    phoneId: number;
    authorId?: number;
    category?: CategoryAttributes;
    phone?: PhoneAttributes;
    author?: UserAttributes;
  }> &
    WithCommit;

  type HoldingAttributes = Attributes<{
    orderDate: string;
    orderUrl?: string;
    orderKey: string;
    reasonId: HoldingReason;
    description?: string;

    departmentId: number;
    holderId: number;
    phones?: PhoneAttributes[];
    holder?: HolderAttributes;
    department?: DepartmentAttributes;
  }> &
    WithCommit &
    WithAuthor;

  type HoldingPhoneAttributes = Attributes<{
    holdingId: number;
    phoneId: number;
    authorId?: number;
    holding?: HoldingAttributes;
    phone?: PhoneAttributes;
    author?: UserAttributes;
  }> &
    WithCommit;

  type HolderAttributes = Attributes<{
    firstName: string;
    lastName: string;
    middleName: string;

    description?: string;
  }>;

  type DepartmentAttributes = Attributes<{
    name: string;
    description?: string;
    placementId?: number;
    placement?: PlacementAttributes;
  }>;

  type PlacementAttributes = Attributes<{
    name: string;
    description?: string;
  }>;

  type PhoneAttributes = Attributes<{
    inventoryKey?: string;
    factoryKey?: string;

    accountingDate: string;
    assemblyDate: string;
    commissioningDate: string;

    phoneModelId: number;

    model?: PhoneModelAttributes;

    // holders?: HolderAttributes[];
    categories?: CategoryAttributes[];
    holdings?: HoldingAttributes[];
    // holders?: HolderAttributes[];
  }> &
    WithCommit &
    WithAuthor;

  type UserAttributes = Attributes<{
    name: string;
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

  type LogTarget =
    | "user"
    | "phone"
    | "category"
    | "holding"
    | "holdingPhone"
    | "categoryPhone"
    | "phoneType"
    | "department"
    | "placement"
    | "holder"
    | "model";
  type LogType = "create" | "delete" | "commit" | "edit";

  type LogAttributes = Attributes<{
    target: LogTarget;
    targetIds?: LogTargetAttributes[];

    type: LogType;
    authorId: number;

    payload?: any;
  }>;
  type LogTargetAttributes = Attributes<{
    targetId: number;
    logId: number;
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
