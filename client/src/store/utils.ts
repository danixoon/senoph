import qs from "query-string";
import { ActionReducerMapBuilder, Draft } from "@reduxjs/toolkit";
import {
  LocationChangeAction,
  LOCATION_CHANGE,
  push,
} from "connected-react-router";
import {
  BaseQueryFn,
  fetchBaseQuery,
  QueryDefinition,
} from "@reduxjs/toolkit/dist/query/react";
import { OmitFromUnion } from "@reduxjs/toolkit/dist/query/tsHelpers";
import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import {
  FetchArgs,
  FetchBaseQueryArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import { clearObject } from "utils";

export const locationQueryReducer = <T extends { filter: F }, F>(
  path: string,
  builder: ActionReducerMapBuilder<T>,
  initialFilter: F,
  middlware?: (state: Draft<T>, action: LocationChangeAction) => void
) =>
  builder.addCase(LOCATION_CHANGE, (state, action: LocationChangeAction) => {
    if (!action.payload.location.pathname.startsWith(path)) return;

    state.filter = { ...initialFilter } as any;
    const query = qs.parse(action.payload.location.search);
    for (const key in query) {
      (state.filter as any)[key] = query[key];
    }
    if (middlware) middlware(state, action);
  });

export const updateQuery = <T>(query: Partial<T>) => {
  const q = clearObject(query);
  return push({ search: qs.stringify(q) });
};

export function isApiError(type: any): type is Api.Error {
  return typeof type.name === "string" && typeof type.code === "number";
}

export const splitStatus: (status: ActionStatus) => SplitStatus = (status) => {
  if (isApiError(status))
    return {
      isError: true,
      error: status,
      isLoading: false,
      isIdle: false,
      isSuccess: false,
    };
  else
    switch (status) {
      case "idle":
        return {
          isLoading: false,
          isIdle: true,
          isSuccess: false,
          isError: false,
        };
      case "loading":
        return {
          isLoading: true,
          isIdle: false,
          isSuccess: false,
          isError: false,
        };

      case "success":
        return {
          isLoading: false,
          isIdle: false,
          isSuccess: true,
          isError: false,
        };
    }
};

// type EndpointCreator<
//   M extends Api.Methods,
//   R extends Api.Routes<M>,
//   TagTypes extends string,
//   BaseQuery extends BaseQueryFn
// > = OmitFromUnion<
//   QueryDefinition<{}, BaseQuery, TagTypes, Api.GetResponse<M, R>>,
//   "type"
// >;
// interface ApiFetchArgs<M extends Api.Methods, R extends Api.Routes<M>>
//   extends FetchArgs {
//   url: string;
//   params: { query: any; body: any };
// }

// export const createEndpoint = <
//   M extends Api.Methods,
//   R extends Api.Routes<M>
//   // TagTypes extends string,
// >(
//   builder: {
//     query:  {
//       query: (arg: {
//         body: Api.GetBody<M, R>;
//         query: Api.GetQuery<M, R>;
//       }) => { url: R };
//     };
//   },
//   method: M,
//   route: R
// ) =>
//   builder.query({
//     query: ({ body, query }) => ({
//       url: route,
//       method,
//       params: query,
//       body: JSON.stringify(body),
//     }),
//   });
