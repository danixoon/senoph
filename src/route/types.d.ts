declare type ItemsResponse<T> = {
  items: T[];
  total: number;
  offset: number;
};

declare type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// Converting all response Date types to string type
// type ApiModel<T, K = RequiredId<T>> = {
//   [P in keyof K]: K[P] extends Date ? string : K[P];
// };

// // type AllowedMethods = "get" | "post" | "put" | "delete" | "patch";
// type Req<M, RB = {}, Q = {}, B = {}> = [M, RB, Q, B];
// type ApiReq<R> = R extends Req<infer _, infer RB, infer Q, infer B>
//   ? import("express").Request<{}, RB, B, Q>
//   : never;

// type ReqQuery<T> = T extends Req<infer _, infer _, infer Q, infer _>
//   ? Q
//   : never;
// type ReqBody<T> = T extends Req<infer _, infer _, infer _, infer B> ? B : never;
// type ResBody<T> = T extends Req<infer _, infer RB, infer _, infer _>
//   ? RB
//   : never;

// type ExtendsWithKey<T, K extends keyof T, V> = T extends { [key: K]: any } ? T : never;

// type res = Api.GetResponse<"post", "/account">;
// type Rout = Api.Routes<"get">;

// type
// type Fn<P> = (v: P) => void;
// type Inter = { (v: "A"): void; (v: "B"): void; (v: "C"): void };
// type InterF = Fn<"A"> & Fn<"B"> & Fn<"C">;
// type F = InterF extends
//   | {
//       (arg: infer V1): void;
//       [K: keyof ]
//     }
//   | { (arg: infer V2): void; (arg: infer V3): void }
//   ? V1 | V2 | V3
//   : never;

declare namespace Api {
  type Router = Omit<import("express").Router, keyof Api.Requests> &
    Api.Requests;
  // type ExpressHandler = import("express").Request;
  namespace Models {
    // declare namespace Api.Model {
    type Phone = RequiredId<DB.PhoneAttributes>;
    type PhoneType = RequiredId<DB.PhoneTypeAttributes>;
    type PhoneCategory = RequiredId<DB.PhoneCategoryAttributes>;
    type PhoneModel = RequiredId<DB.PhoneModelAttributes>;
    type Department = RequiredId<DB.DepartmentAttributes>;
    type User = Omit<RequiredId<DB.UserAttributes>, "passwordHash">;
    type Holder = RequiredId<DB.HolderAttributes>;
    type Holding = RequiredId<DB.HoldingAttributes>;
    // }
  }

  type ModelMap = {
    phone: Models.Phone;
    phoneType: Models.PhoneType;
    phoneModel: Models.PhoneModel;
    department: Models.Department;
    phoneCategory: Models.PhoneCategory;
    user: Models.User;
    holder: Models.Holder;
    holding: Models.Holder;
  };

  type Methods = keyof RequestsMap;

  type GetResponse<M extends Methods, R extends Routes<M>> = Extract<
    RequestsMap[M],
    RouteHandler<R, any, any, any>
  > extends RouteHandler<any, infer RB, any, any>
    ? RB
    : never;

  type GetQuery<M extends Methods, R extends Routes<M>> = Extract<
    RequestsMap[M],
    RouteHandler<R, any, any, any>
  > extends RouteHandler<any, any, infer Q, any>
    ? Q
    : never;

  type GetBody<M extends Methods, R extends Routes<M>> = Extract<
    RequestsMap[M],
    RouteHandler<R, any, any, any>
  > extends RouteHandler<any, any, any, infer B>
    ? B
    : never;

  type Routes<M extends Methods> = RequestsMap[M] extends RouteHandler<
    infer R,
    any,
    any,
    any
  >
    ? R
    : never;

  type WithError = { error: Error };

  // type ErrorNames<T = import("../utils/errors").ErrorType> = Extract<T[keyof T], any>

  // type T = ErrorNames;
  type ErrorType =
    typeof import("../utils/errors").errorType[keyof typeof import("../utils/errors").errorType];

  type Error = {
    name: ErrorType;
    message: string;
    code: number;

    description?: string;
    payload?: any;
  };
  type Request<
    P,
    RB = any,
    Q = any,
    B = any
  > = import("express").RequestHandler<P, RB | WithError, B, Q>;

  type RouteHandler<R extends string, RB, Q, B> = <P>(
    route: R,
    ...handlers: Request<P, RB, Q, B>[]
  ) => void;

  type Requests = {
    [K in Methods]: UnionToIntersection<RequestsMap[K]>;
  };

  type RequestsMap = {
    [K in keyof FnRequestsMap]: FnRequestsMap[K] extends (
      ...args: any[]
    ) => infer R
      ? R
      : never;
  };

  type ExcludeType<T, E, P = { [K in keyof T]: K }> = Pick<
    T,
    P extends {
      [K in keyof P]: infer V;
    }
      ? V extends keyof T
        ? E extends T[V]
          ? never
          : V
        : never
      : never
  >;

  type FnRequestsMap = {
    get:
      | (() => RouteHandler<"/account", Api.Models.User, {}, {}>)
      | (() => RouteHandler<
          "/account/login",
          { id: number; role: Role; token: string },
          { username: string; password: string },
          {}
        >)
      | (() => RouteHandler<
          "/commit",
          Record<number, any>,
          { target: ChangesTargetName },
          {}
        >)
      | (() => RouteHandler<
          "/phone/byId",
          Api.Models.Phone,
          { id: number },
          {}
        >)
      | (() => RouteHandler<
          "/phone",
          ItemsResponse<Api.Models.Phone>,
          Partial<{
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
          }> & { offset: number; amount: number },
          {}
        >)
      | (() => RouteHandler<
          "/filter",
          {
            models: Pick<
              Api.Models.PhoneModel,
              "id" | "name" | "phoneTypeId"
            >[];
            types: Pick<Api.Models.PhoneType, "id" | "name">[];
            departments: Pick<Api.Models.Department, "id" | "name">[];
          },
          {},
          {}
        >)
      | (() => RouteHandler<
          "/model",
          ItemsResponse<Api.Models.PhoneModel>,
          { name?: string; id?: number },
          {}
        >)
      | (() => RouteHandler<
          "/holder",
          ItemsResponse<Api.Models.Holder>,
          {
            id?: number;
            name?: string;
            departmentId?: number;
          },
          {}
        >);
    // | (() => RouteHandler<
    //     "/commit/entity",
    //     ItemsResponse<{
    //       action: CommitActionType;
    //       id: number;
    //       target: CommitTargetName;
    //     }>,
    //     {},
    //     {}
    //   >);

    post:
      | (() => RouteHandler<
          "/commit",
          {},
          { target: ChangesTargetName; targetId: number },
          any
        >)
      | (() => RouteHandler<
          "/account",
          Api.Models.User,
          { username: string; password: string; role: Role },
          {}
        >)
      | (() => RouteHandler<
          "/phone",
          {},
          {},
          {
            data: Omit<
              ExcludeType<Api.Models.Phone, undefined>,
              "authorId" | "id"
            >[];
          }
        >);

    put:
      | (() => RouteHandler<
          "/phone",
          {},
          { id: number },
          Partial<
            Pick<
              Api.Models.Phone,
              | "accountingDate"
              | "assemblyDate"
              | "commissioningDate"
              | "factoryKey"
              | "inventoryKey"
            >
          >
        >)
      | (() => RouteHandler<
          "/commit/phone" | "/commit/holder",
          {},
          { id: number; action: "approve" | "decline" },
          {}
        >);
    // | (() => RouteHandler<
    //     "/commit/entity",
    //     {},
    //     {
    //       target: CommitTargetName;
    //       targetId: number;
    //       action: CommitActionType;
    //     },
    //     any
    //   >);

    delete: () => RouteHandler<
      "/commit",
      {},
      { target: ChangesTargetName; targetId: number; keys: string[] },
      {}
    >;
  };
}

// declare namespace ApiRequest {
//   type Login = Req<
//     { id: number; role: Role; token: string },
//     { username: string; password: string }
//   >;

//   // type UpdatePhone =
// }
