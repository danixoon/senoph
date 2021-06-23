declare type WithId<T> = OptionalId<T>;
declare type WithoutId<T> = Omit<T, "id">;
declare type OptionalId<T> = WithoutId<T> & { id?: number };
declare type Role = "admin" | "user";

declare namespace Database {
  type User = import("@backend/db/models/user.model").UserAttribues;
  type PhoneType =
    import("@backend/db/models/phoneType.model").PhoneTypeAttributes;
  type PhoneModel =
    import("@backend/db/models/phoneModel.model").PhoneModelAttributes;
  type PhoneCategory =
    import("@backend/db/models/phoneCategory.model").PhoneCategoryAttribues;
  type Holding = import("@backend/db/models/holding.model").HoldingAttributes;
  type Holder = import("@backend/db/models/holder.model").HolderAttributes;
  type Department =
    import("@backend/db/models/department.model").DepartmentAttributes;
  type Phone = import("@backend/db/models/phone.model").PhoneAttributes;
}
