declare type ItemsResponse<T> = {
  items: T[];
  total: number;
  offset: number;
};

// Converting all response Date types to string type
// type ApiModel<T, K = RequiredId<T>> = {
//   [P in keyof K]: K[P] extends Date ? string : K[P];
// };

declare namespace ApiResponse {
  declare type Phone = RequiredId<Models.PhoneAttributes>;
  declare type PhoneType = RequiredId<Models.PhoneTypeAttributes>;
  declare type PhoneModel = RequiredId<Models.PhoneModelAttributes>;
  declare type Department = RequiredId<Models.DepartmentAttributes>;

  declare type FetchModels = ItemsResponse<PhoneModel>;
  declare type FetchFilterConfig = {
    models: Pick<PhoneModel, "id" | "name" | "phoneTypeId">[];
    types: Pick<PhoneType, "id" | "name">[];
    departments: Pick<Department, "id" | "name">[];
  };
  declare type FetchPhones = ItemsResponse<Phone>;
  declare type FetchPhone = Phone;
}

declare namespace ApiRequest {
  declare type FetchPhones = Partial<{
    search: string;
    inventoryKey: string;
    factoryKey: string;
    phoneModelId: number;
    phoneTypeId: number;
    departmentId: number;
    category: number;
    sortKey: string;
    sortDir: "asc" | "desc";
  }> & { offset: number; amount: number };

  declare type FetchPhone = {
    id: number;
  };
}
