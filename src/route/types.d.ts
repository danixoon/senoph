declare type ItemsResponse<T> = {
  items: T[];
  total: number;
  offset: number;
};

declare namespace ApiResponse {
  declare type Phone = Database.Phone;
  declare type PhoneType = Database.PhoneType;
  declare type Department = Database.PhoneType;
  declare type Model = Database.PhoneModel;

  declare type FetchModels = ItemsResponse<Database.Model>;
  declare type FetchFilterConfig = {
    models: Pick<Model, "id" | "name" | "phoneTypeId">[];
    types: Pick<PhoneType, "id" | "name">[];
    departments: Pick<Department, "id" | "name">[];
  };
  declare type FetchPhones = ItemsResponse<Database.Phone>;
}

declare namespace ApiRequest {
  declare type FetchPhones = Partial<{
    search: string;
    phoneModelId: number;
    phoneTypeId: number;
    departmentId: number;
    category: number;
    orderKey: "phoneModel" | "phoneType" | "department" | "category" | keyof Pick<Database.Phone, "accountingDate" | "assemblyDate" | "commissioningDate" | "factoryKey" | "id">;
    orderDir: "asc" | "desc";
  }> & { offset: number; amount: number };
}
