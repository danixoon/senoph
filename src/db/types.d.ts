declare type WithId<T> = T & { id: number };
declare type WithoutId<T> = Omit<T, "id">;
declare type Role = "admin" | "user";

declare namespace Database {
  type Phone = WithId<{
    inventoryKey: string;
    factoryKey: string;

    assemblyDate: Date;
    accountingDate: Date;
    commissioningDate: Date;

    modelId: number;
    holderId: number;
  }>;

  type Model = WithId<{
    name: string;
    accountingDate: Date;
  }>;

  type Holder = WithId<{
    firstName: string;
    lastName: string;
    middleName: string;
  }>;

  type Department = WithId<{
    name: string;
  }>;

  type PhoneCategory = WithId<{
    category: number;
    date: Date;

    phoneId: number;
  }>;

  type Holding = WithId<{
    actDate: Date;
    actKey: number;

    holderId: number;
    phoneId: number;
  }>;

  type User = WithId<{
    username: string;
    passwordHash: string;

    role: Role;
  }>;
}
