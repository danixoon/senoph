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
  type Phone = RequiredId<Models.PhoneAttributes>;
  type PhoneType = RequiredId<Models.PhoneTypeAttributes>;
  type PhoneModel = RequiredId<Models.PhoneModelAttributes>;
  type Department = RequiredId<Models.DepartmentAttributes>;

  type FetchModels = ItemsResponse<PhoneModel>;
  type FetchFilterConfig = {
    models: Pick<PhoneModel, "id" | "name" | "phoneTypeId">[];
    types: Pick<PhoneType, "id" | "name">[];
    departments: Pick<Department, "id" | "name">[];
  };
  type FetchPhones = ItemsResponse<Phone>;
  type FetchPhone = Phone;
}

// type AllowedMethods = "get" | "post" | "put" | "delete" | "patch";
type Req<M, RB = {}, Q = {}, B = {}> = [M, RB, Q, B];
type ApiReq<R> = R extends Req<infer _, infer RB, infer Q, infer B>
  ? import("express").Request<{}, RB, B, Q>
  : never;

type ReqQuery<T> = T extends Req<infer _, infer _, infer Q, infer _>
  ? Q
  : never;
type ReqBody<T> = T extends Req<infer _, infer _, infer _, infer B> ? B : never;
type ResBody<T> = T extends Req<infer _, infer RB, infer _, infer _>
  ? RB
  : never;

type ApiMethods = Api.Requests[keyof Api.Requests] extends Req<infer M>
  ? M
  : never;

declare namespace Api {
  type Error = {
    message?: string;
    code: number;
  };
  type Request<RB = any, Q = any, B = any> = import("express").RequestHandler<
    {},
    RB | Api.Error,
    B,
    Q
  >;

  type RouteHandler<R, RB, Q, B> = (
    route: R,
    ...handlers: Request<RB, Q, B>[]
  ) => void;

  type Requests = {
    get: RouteHandler<
      "/account/login",
      { id: number; role: Role; token: string },
      { username: string; password: string },
      {}
    > &
      RouteHandler<"/commit", {}, { target: ChangesTargetName }, {}>;

    post: RouteHandler<
      "/commit",
      {},
      { target: ChangesTargetName; targetId: number },
      {}
    > &
      RouteHandler<
        "/account",
        {},
        { username: string; password: string; role: Role },
        {}
      >;

    delete: RouteHandler<
      "/commit",
      {},
      { target: ChangesTargetName; targetId: number; keys: string[] },
      {}
    >;
  };
}

declare namespace ApiRequest {
  type Login = Req<
    { id: number; role: Role; token: string },
    { username: string; password: string }
  >;

  type FetchPhones = Partial<{
    search: string;
    inventoryKey: string;
    factoryKey: string;
    phoneModelId: number;
    phoneTypeId: number;
    departmentId: number;
    category: number;
    sortKey: string;
    sortDir: "asc" | "desc";
    exceptIds: number[];
    ids: number[];
  }> & { offset: number; amount: number };

  type FetchPhone = {
    id: number;
  };

  type UpdatePhone = Partial<
    Pick<
      Models.PhoneAttributes,
      | "accountingDate"
      | "assemblyDate"
      | "commissioningDate"
      | "factoryKey"
      | "inventoryKey"
    >
  > & { id: number };
}
