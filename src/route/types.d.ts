declare type ItemsResponse<T> = {
  items: T[];
  total: number;
  offset: number;
};

declare type WithRandomId<T, K extends string = "randomId"> = T &
  Record<K, string>;

declare type GetItemType<T extends ItemsResponse<any>> =
  T extends ItemsResponse<infer I> ? I : never;

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
  type Attributes<T> = RequiredId<T> & { createdAt: string };
  type Router = Omit<import("express").Router, keyof Api.Requests> &
    Api.Requests;
  // type ExpressHandler = import("express").Request;
  namespace Models {
    // declare namespace Api.Model {
    type Phone = RequiredId<DB.PhoneAttributes>;
    type PhoneType = RequiredId<DB.PhoneTypeAttributes>;
    type Category = RequiredId<DB.CategoryAttributes> & { phoneIds: number[] };
    type PhoneModel = RequiredId<DB.PhoneModelAttributes>;
    type Department = RequiredId<DB.DepartmentAttributes>;
    type Placement = RequiredId<DB.PlacementAttributes>;
    type Backup = { tag: string; id: string; date: Date; size: number };
    type User = Omit<RequiredId<DB.UserAttributes>, "passwordHash">;
    type Holder = RequiredId<DB.HolderAttributes>;
    type Holding = RequiredId<DB.HoldingAttributes> & { phoneIds: number[] };
    type Log = RequiredId<DB.LogAttributes>;
    type Notice = {
      phone: { changes: number; commits: number };
      holding: { commits: number; changes: number };
      category: { commits: number; changes: number };
    };
    // }
  }

  type ModelMap = {
    phone: Models.Phone;
    phoneType: Models.PhoneType;
    phoneModel: Models.PhoneModel;
    department: Models.Department;
    category: Models.Category;
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
      | (() => RouteHandler<"/notice", Api.Models.Notice, {}, {}>)
      | (() => RouteHandler<"/admin/backup/export", Blob, { id: string }, {}>)
      | (() => RouteHandler<
          "/admin/backups",
          ItemsResponse<{
            id: string;
            tag: string;
            date: string;
            size: number;
          }>,
          {},
          {}
        >)
      | (() => RouteHandler<"/import", {}, { entity: "phone" }, {}>)
      | (() => RouteHandler<"/account", Api.Models.User, {}, {}>)
      | (() => RouteHandler<
          "/account/login",
          { id: number; role: Role; token: string },
          { username: string; password: string },
          {}
        >)
      | (() => RouteHandler<
          "/commit",
          ItemsResponse<{
            id: number;
            authorId: number;
            createdAt?: string;
            [key: string]: any;
          }>,
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
            accountingDate: Date;
            comissioningDate: Date;
            assemblyDate: Date;
            departmentId: number | null;
            holderId: number;
            category: CategoryKey | null;
            sortKey: string;
            authorId: number;
            sortDir: "asc" | "desc";
            exceptIds: number[];
            warranty: boolean;
            ids: number[];
          }> & { offset: number; amount: number },
          {}
        >)
      | (() => RouteHandler<
          "/model",
          ItemsResponse<Api.Models.PhoneModel>,
          { name?: string; id?: number },
          {}
        >)
      | (() => RouteHandler<
          "/holders",
          ItemsResponse<Api.Models.Holder>,
          {
            id?: number;
            name?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/phone/commit",
          ItemsResponse<Api.Models.Phone>,
          {
            status?: CommitStatus;
            offset?: number;
            amount?: number;
            authorId?: number;
          },
          {}
        >)
      | (() => RouteHandler<
          "/holdings",
          ItemsResponse<Api.Models.Holding>,
          {
            ids?: number[];
            status?: CommitStatus | "based" | "pending";
            departmentId?: number;
            holderId?: number;
            orderDate?: Date;
            orderKey?: string;

            offset?: number;
            amount?: number;
          },
          {}
        >)
      | (() => RouteHandler<
          "/holding/phones",
          ItemsResponse<Api.Models.Phone>,
          {
            holdingId: number;
            ids?: number[];
            inventoryKey?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/holdings/commit",
          ItemsResponse<{
            holdingId: number;
            authorId: number;
            commits: ({ phoneId: number } & WithCommit)[];
          }>,
          {
            // ids?: number[];
            status?: CommitStatus;
          },
          {}
        >)
      | (() => RouteHandler<
          "/categories",
          ItemsResponse<Api.Models.Category>,
          {
            ids?: number[];
            status?: CommitStatus | "based";
            actDate?: Date;
            actKey?: string;
            categoryKey?: CategoryKey;
            pending?: boolean;

            offset?: number;
            amount?: number;
          },
          {}
        >)
      | (() => RouteHandler<
          "/categories/commit",
          ItemsResponse<{
            categoryId: number;
            authorId: number;
            commits: ({ phoneId: number } & WithCommit)[];
          }>,
          {
            // ids?: number[];
            status?: CommitStatus;
          },
          {}
        >)
      | (() => RouteHandler<
          "/accounts",
          ItemsResponse<Api.Models.User>,
          {},
          {}
        >)
      | (() => RouteHandler<
          "/departments",
          ItemsResponse<Api.Models.Department>,
          {
            ids?: number[];
          },
          {}
        >)
      | (() => RouteHandler<
          "/placements",
          ItemsResponse<Api.Models.Placement>,
          {
            ids?: number[];
          },
          {}
        >)
      | (() => RouteHandler<
          "/phone/types",
          ItemsResponse<Api.Models.PhoneType>,
          {
            ids?: number[];
          },
          {}
        >)
      | (() => RouteHandler<
          "/phone/models",
          ItemsResponse<Api.Models.PhoneModel>,
          {
            ids?: number[];
            name?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/logs",
          ItemsResponse<Api.Models.Log>,
          { offset?: number; amount?: number },
          {}
        >)
      | (() => RouteHandler<
          "/log/system",
          ItemsResponse<{
            level: string;
            message: string;
            service: string;
            timestamp: string;
            payload: any;
          }>,
          { offset: number; amount: number },
          {}
        >);

    // ??????????????
    post:
      | (() => RouteHandler<
          "/category/phones",
          ItemsResponse<Api.Models.Phone>,
          {
            categoryId: number;

            inventoryKey?: string;
          },
          { ids?: number[] }
        >)
      | (() => RouteHandler<
          "/phone/holdings",
          ItemsResponse<Api.Models.Holding>,
          { orderDate?: string; orderKey?: string },
          { phoneIds: number[] }
        >)
      | (() => RouteHandler<
          "/phone/categories",
          ItemsResponse<Api.Models.Category>,
          { actDate?: string; actKey?: string },
          { phoneIds: number[] }
        >)
      | (() => RouteHandler<
          "/admin/backup/import",
          { id: string },
          { unsafe?: boolean },
          { file: File }
        >)
      | (() => RouteHandler<
          "/admin/backup",
          { id: string },
          { tag: string },
          {}
        >)
      | (() => RouteHandler<"/admin/backup/revert", {}, { id: string }, {}>)
      | (<T extends "phone" | "model">() => RouteHandler<
          `/import`,
          {},
          { target: T },
          T extends "phone"
            ? WithoutId<{
                phones: Omit<DB.PhoneAttributes, "authorId">[];
                holdings: {
                  holderId: number;
                  departmentId: number;
                  orderDate: string;
                  orderKey: string;
                  // merge: boolean;
                  phoneRandomIds: string[];
                }[];
              }>
            : never
        >)
      | (<T extends "phone" | "model">() => RouteHandler<
          `/import/file`,
          T extends "phone"
            ? WithoutId<{
                phones: WithRandomId<Omit<DB.PhoneAttributes, "authorId">>[];
                holdings: {
                  holderId: number;
                  departmentId: number;
                  orderDate: string;
                  orderKey: string;
                  merge: boolean;
                  phoneRandomIds: string[];
                }[];
              }>
            : never,
          { target: T },
          { file: FileList }
        >)
      | (() => RouteHandler<
          "/commit",
          {},
          { target: ChangesTargetName; targetId: number },
          any
        >)
      | (() => RouteHandler<
          "/account",
          Api.Models.User,
          Omit<Api.Models.User, "id" | "createdAt"> & { password: string },
          {}
        >)
      | (() => RouteHandler<
          "/phone",
          { created: WithRandomId<{ id: number }>[] },
          {},
          {
            data: WithRandomId<Omit<Api.Models.Phone, "authorId" | "id">>[];
          }
        >)
      | (() => RouteHandler<
          "/holding",
          { holdingId: number },
          {},
          {
            orderFile?: FileList;
            phoneIds?: number[];
            holderId: number;
            departmentId: number;

            reasonId: HoldingReason;
            description?: string;

            orderDate: string;
            orderKey: string;
          }
        >)
      | (() => RouteHandler<
          "/category",
          { id: number },
          {},
          {
            categoryKey: CategoryKey;
            actFile: FileList;
            actDate: Date;
            actKey: string;
            phoneIds: number[];

            description?: string;
          }
        >)
      | (() => RouteHandler<
          "/department",
          { id: number },
          { name: string; description?: string; placementId?: number },
          {}
        >)
      | (() => RouteHandler<
          "/placement",
          { id: number },
          { name: string; description?: string },
          {}
        >)
      | (() => RouteHandler<
          "/phone/type",
          { id: number },
          { name: string; description?: string },
          {}
        >)
      | (() => RouteHandler<
          "/phone/model",
          { id: number },
          {},
          {
            name: string;
            phoneTypeId: number;
            description?: string;
            details: {
              type: DB.PhoneModelDetailType;
              name: string;
              amount: number;
              units: string;
            }[];
          }
        >)
      | (() => RouteHandler<
          "/holder",
          { id: number },
          {
            firstName: string;
            lastName: string;
            middleName: string;
            description?: string;
          },
          {}
        >);

    put:
      | (() => RouteHandler<
          "/commit",
          {},
          { targetId: number; target: ChangesTargetName; userId?: number },
          {}
        >)
      | (() => RouteHandler<
          "/account",
          { id: number },
          {
            id: number;
            username?: string;
            password?: string;
            name?: string;
            role?: Role;
          },
          {}
        >)
      | (() => RouteHandler<
          "/department",
          { id: number },
          {
            id: number;
            name?: string;
            placementId?: number;
            description?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/placement",
          { id: number },
          {
            id: number;
            name?: string;
            description?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/phone/type",
          { id: number },
          {
            id: number;
            name?: string;
            lifespan?: number;
            description?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/phone/model",
          { id: number },
          {
            id: number;
            name?: string;
            description?: string;
          },
          {
            details?: {
              type: DB.PhoneModelDetailType;
              name: string;
              amount: number;
              units: string;
            }[];
          }
        >)
      | (() => RouteHandler<
          "/holder",
          { id: number },
          {
            id: number;
            firstName?: string;
            lastName?: string;
            middleName?: string;
            description?: string;
          },
          {}
        >)
      | (() => RouteHandler<
          "/holding",
          {},
          {
            action: "remove" | "add";
            phoneIds: number[];
            holdingId: number;
          },
          {}
        >)
      | (() => RouteHandler<
          "/category",
          {},
          {
            action: "remove" | "add";
            phoneIds: number[];
            categoryId: number;
          },
          {}
        >)
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
          | "/commit/phone"
          | "/commit/holder"
          | "/commit/holding"
          | "/commit/category",
          {},
          {},
          { ids: number[]; action: CommitActionType }
        >)
      | (() => RouteHandler<
          "/commit/holding/phone",
          {},
          {},
          { phoneIds: number[]; holdingId: number; action: CommitActionType }
        >)
      | (() => RouteHandler<
          "/commit/category/phone",
          {},
          {},
          { phoneIds: number[]; categoryId: number; action: CommitActionType }
        >);

    delete:
      | (() => RouteHandler<
          "/commit",
          {},
          {
            target: ChangesTargetName;
            userId?: number;
            targetId: number;
            keys?: string[];
          },
          {}
        >)
      | (() => RouteHandler<"/admin/backup", {}, { id: string }, {}>)
      | (() => RouteHandler<"/category", {}, { id: number }, {}>)
      | (() => RouteHandler<"/holding", {}, { id: number }, {}>)
      | (() => RouteHandler<"/phone", {}, { ids: number[] }, {}>)
      | (() => RouteHandler<"/account", {}, { id: number }, {}>)
      | (() => RouteHandler<"/placement", {}, { id: number }, {}>)
      | (() => RouteHandler<"/department", {}, { id: number }, {}>)
      | (() => RouteHandler<"/phone/type", {}, { id: number }, {}>)
      | (() => RouteHandler<"/phone/model", {}, { id: number }, {}>)
      | (() => RouteHandler<"/holder", {}, { id: number }, {}>);
  };
}

// declare namespace ApiRequest {
//   type Login = Req<
//     { id: number; role: Role; token: string },
//     { username: string; password: string }
//   >;

//   // type UpdatePhone =
// }
