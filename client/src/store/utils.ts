import qs from "query-string";
import {
  ActionReducerMapBuilder,
  Draft,
  SerializedError,
} from "@reduxjs/toolkit";
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

export const updateQuery = <T>(query: Partial<T>, pathname?: string) => {
  const q = clearObject(query);
  const search = qs.stringify(q).trim();
  // if (pathname)
  // return push({ pathname: `${pathname}${search ? `/${search}` : ""}` });
  return push({ search, pathname });
};

export function isApiError(type: any): type is Api.Error {
  return (
    type !== undefined &&
    typeof type.name === "string" &&
    typeof type.code === "number"
  );
}

// export const getStatus = ()

export const getError: (
  e?: SerializedError | FetchBaseQueryError
) => Api.Error | null = (e) => {
  const error = (e as any)?.data?.error;
  return (error as Api.Error) ?? null;
};

export const getErrorMessage = (
  e?: SerializedError | FetchBaseQueryError | Api.Error
) => {
  let err: Api.Error | null = null;
  if (isApiError(e)) err = e;
  else err = getError(e);

  return err?.description ?? err?.message ?? "Ошибка";
};

// export const getIdleStatus: ApiStatus = splitStatus("idle");

export function isItemsResponse<T>(type: any): type is ItemsResponse<T> {
  return type.items && Array.isArray(type.items);
}

export const parseQuery = <T extends { data?: K } & Statusable, K>(
  query: T
) => {
  const { data, ...info } = query;
  const status = extractStatus(info);

  return { data, status };
};

type ParseItems = <K>(query: { data?: ItemsResponse<K> } & Statusable) => {
  data: ItemsResponse<K>;
  status: ApiStatus;
};

export const parseItems: ParseItems = (query) => {
  const { data, ...info } = query;
  const status = extractStatus(info);

  return {
    data: data ?? { items: [], total: 0, offset: 0 },
    status,
  };
};

type Statusable = {
  isError?: boolean;
  isLoading?: boolean;
  isIdle?: boolean;
  isSuccess?: boolean;
  isFetching?: boolean;
  error?: any;
};
export const extractStatus = (
  { isError, isLoading, isIdle, isSuccess, isFetching, error }: Statusable,
  fetchCheck?: boolean
) =>
  ({
    isLoading: isLoading === true || (fetchCheck && isFetching),
    isSuccess: isSuccess === true,
    isError: isError === true,
    isIdle: isIdle === true,
    error: isApiError(error?.data?.error) ? error?.data?.error : null,
    status: isLoading
      ? "loading"
      : isSuccess
      ? "success"
      : isIdle
      ? "idle"
      : isError
      ? "error"
      : null,
  } as ApiStatus);
export const splitStatus: (status: ActionStatus) => ApiStatus = (status) => {
  if (isApiError(status))
    return {
      isError: true,
      error: status,
      isLoading: false,
      isIdle: false,
      isSuccess: false,
      status: "error",
    };
  else
    switch (status) {
      case "idle":
        return {
          isLoading: false,
          isIdle: true,
          isSuccess: false,
          isError: false,
          error: null,
          status,
        };
      case "loading":
        return {
          isLoading: true,
          isIdle: false,
          isSuccess: false,
          isError: false,
          error: null,
          status,
        };

      case "success":
        return {
          isLoading: false,
          isIdle: false,
          isSuccess: true,
          isError: false,
          error: null,
          status,
        };
    }
};

export class EmptyError extends Error {
  key: string;
  constructor(key: string) {
    super(`${key} is empty`);
    this.key = key;
  }
}

export const checkEmptiness = <T>(obj: T) => {
  for (const key in obj) if (obj[key] == null) throw new EmptyError(key);
  return obj as { [K in keyof T]: NonNullable<T[K]> };
};

export const convertDate = (date: string) => {
  const [day, month, year] = date.split(".");
  try {
    return new Date(Number(year), Number(month), Number(day));
  } catch (err) {
    throw new Error("Invalid date");
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
