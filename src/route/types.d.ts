declare type ItemsResponse<T> = {
  items: T[];
};

declare namespace ApiResponse {
  declare type Phone = Database.Phone;
  declare type PhoneType = Database.PhoneType;
  declare type Department = Database.PhoneType;
  declare type Model = Database.Model;

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
    modelId: number;
    phoneTypeId: number;
    departmentId: number;
    category: number;
  }> & { offset: number; amount: number };
}
