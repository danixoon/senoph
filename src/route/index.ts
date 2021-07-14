import { IRouter, RequestHandler, Router } from "express";

// type RouterMethods = "get" | "post" | "put" | "delete" | "patch";
// type IAppRouterMethods = Pick<IRouter, ApiMethods>;

// type IAppRouter = Omit<Router, ApiMethods> &
//   {
//     [M in ApiMethods]: Api.Requests[keyof Api.Requests] extends Req<M>
//       ? RequestHandler<keyof Api.Requests> extends RequestHandler<infer R>
//         ? R extends keyof Api.Requests
//           ? {
//               (
//                 route: R,
//                 ...handlers: RequestHandler<
//                   R,
//                   ResBody<Api.Requests[R]>,
//                   ReqBody<Api.Requests[R]>,
//                   ReqQuery<Api.Requests[R]>
//                 >[]
//               ): void;
//             }
//           : never
//         : never
//       : never;
//   };

// type B = "c" | "b" in "c" ? true : false;

type B<T1, T2> = [T1, T2];
type O = B<"hey", 1> | B<"hey2", 2>;
// type F = {
//   [K in keyof O]: O[keyof O] extends B<infer K, infer V>
//     ? { (key: K, v: V): void }
//     : never;
// };

// type ExT1<T> = O[keyof O] extends [infer T1, infer T2] ?
// type F = O extends B<infer T1, any> ? (key: T1, k: any) => void : never;

// const f: F = {};

// type T = "a" extends "a" & "b" ? true : false;

// declare namespace Bullshit {
//   // type Methods = "get" | "post";
//   // type Get = "get" | "post";
//   type Methods = Requests extends Request<infer M, infer _, infer _>
//     ? M
//     : never;

//   type Routes = ToObj<
//     Requests extends [infer M, infer R, infer _]
//       ? M extends string
//         ? {
//             [K in M]: string;
//           }
//         : never
//       : never
//   >;

//   type Tf = "a" | "b" extends "a" ? true : false;

//   type GetPayload<M, R> = Requests extends Request<infer IM, infer IR, infer Q>
//     ? IM extends M
//       ? IR extends R
//         ? Q
//         : never
//       : never
//     : never;
//   type GetRoute<ME> = ToObj<
//     Requests extends Request<infer M, infer R, infer Q>
//       ? M extends ME
//         ? R extends string
//           ? ToObj<
//               {
//                 [K in R]: GetPayload<M, R>;
//               }
//             >
//           : never
//         : never
//       : never
//   >;

//   type M = GetRoute<"post">;

//   // type Extr<M> = M extends Methods
//   // ? ToObj<Requests> extends Request<M, infer R, infer Q>
//   // ? R
//   // : never
//   // : never;

//   // type E = ToObj<Requests>;

//   type GetQuery<M, R> = Requests extends Request<M, R, infer Q> ? Q : never;
//   type Request<M, R, Q> = [M, R, Q];
//   type Requests =
//     | Request<"get", "/account", { id: number }>
//     | Request<"get", "/user", { id: number }>
//     | Request<"post", "/foo", { username: string }>;

//   // M = get | post
//   type IAppRouter = Requests extends Request<infer M, infer R, infer _>
//     ? M extends string
//       ? {
//           [M_ in M]: (route: GetRoute<M>) => void;
//         }
//       : never
//     : never;

//   type AllKeys<T> = T extends any ? keyof T : never;
//   type PickType<T, K extends AllKeys<T>> = T extends { [k in K]: any }
//     ? T[K]
//     : undefined;
//   type CommonKeys<T extends object> = keyof T;
//   type ExtractFN<M> = (route: GetRoute<M>) => void;
//   type IIAppRouter = {
//     [K in AllKeys<IAppRouter>]: ExtractFN<K>; // Exclude<PickType<IAppRouter, K>, undefined>;
//   };

//   type ToObj<T> = {
//     [K in AllKeys<T>]: Exclude<PickType<T, K>, undefined>;
//   };

//   // type R = GetRoute<"get">
// }

// const rr = Router() as any as Bullshit.IIAppRouter;
// rr.get();
// // rr.
// // rr.sd()

// // (key: "hey", v: 1) => void | (key: "hewwo", v: 2) => void

// type IAppRouter = Omit<Router, ApiMethods> &
//   {
//     [M in ApiMethods]: RequestHandler<
//       //Api.Requests[keyof Api.Requests] extends Req<M>
//       keyof Api.Requests
//     > extends RequestHandler<infer R>
//       ? R extends keyof Api.Requests
//         ? {
//             (
//               route: R,
//               ...handlers: RequestHandler<
//                 R,
//                 ResBody<Api.Requests[R]>,
//                 ReqBody<Api.Requests[R]>,
//                 ReqQuery<Api.Requests[R]>
//               >[]
//             ): void;
//           }
//         : never
//       : never;
//     //: never;
//   };

type ApiRouter = Omit<Router, keyof Api.Requests> & Api.Requests;

export const AppRouter = () => {
  return Router() as any as ApiRouter;
};

const r = AppRouter();

// r.get("/commit", (req, res, next) => {});

// r.get("")

// r.get("/login", (req, res) => {
//   // req.query.pas
// });
// r.use();
