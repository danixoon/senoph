import {
  Api,
  ApiModules,
  CreateApi,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const convertItem = (item: any) => {
  const converted = { ...item };
  for (let key in converted)
    if (key.endsWith("Date")) converted[key] = new Date(converted[key]);

  return converted;
};

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["commit"],
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const { app } = getState() as StoreType;
      if (app.token)
        headers.set(
          "Authorization",
          app.token //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6MiwiaWF0IjoxNjI2MjcyODQ2fQ.rrA63hITTCZUEffVcbx-rbIThZwryc2tbYhClMmqVL8"
        );

      return headers;
    },
  }),
  endpoints: (builder) => ({
    userLogin: builder.mutation<
      Api.GetResponse<"get", "/account/login">,
      Api.GetQuery<"get", "/account/login">
    >({
      query: (params) => ({ url: "account/login", params }),
    }),
    fetchPhones: builder.query<
      Api.GetResponse<"get", "/phone">,
      Api.GetQuery<"get", "/phone">
    >({
      query: (params) => ({ url: "phone", params }),
    }),
    fetchSelectedPhones: builder.query<
      Api.GetResponse<"get", "/phone">,
      Api.GetQuery<"get", "/phone">
    >({
      query: (params) => ({ url: "phone", params }),
    }),
    fetchPhone: builder.query<
      Api.GetResponse<"get", "/phone/byId">,
      Api.GetQuery<"get", "/phone/byId">
    >({
      query: (params) => ({ url: "phone/byId", params }),
    }),
    fetchFilterConfig: builder.query<
      Api.GetResponse<"get", "/filter">,
      Api.GetQuery<"get", "/filter">
    >({
      query: () => "filter",
    }),
    fetchChanges: builder.query<
      Api.GetResponse<"get", "/commit">,
      Api.GetQuery<"get", "/commit">
    >({
      query: (params) => ({ url: "commit", params }),
      providesTags: (r, e, a) => [
        // ...(r
        //   ? Object.keys(r).map((targetId) => ({
        //       type: "commit" as const,
        //       id: `${a.target}/${targetId}`,
        //     }))
        //   : []),
        { type: "commit", id: a.target },
      ],
    }),
    makeChanges: builder.mutation<
      Api.GetResponse<"post", "/commit">,
      Api.GetQuery<"post", "/commit"> & { changes: any }
    >({
      query: ({ changes, ...params }) => ({
        url: "commit",
        params,
        method: "post",
        body: changes,
      }),
      invalidatesTags: (r, e, a) => [
        // { type: "commit", id: `${a.target}/${a.targetId}` },
        { type: "commit", id: a.target },
      ],
    }),
    undoChanges: builder.mutation<
      Api.GetResponse<"delete", "/commit">,
      Api.GetQuery<"delete", "/commit">
    >({
      query: (params) => ({
        url: "commit",
        params,
        method: "delete",
      }),
      invalidatesTags: (r, e, a) => [{ type: "commit", id: a.target }],
    }),
  }),
});

// TODO: Learn how names generated in typescript with prefix from user-defined object
export const {
  useFetchPhonesQuery,
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
  useUserLoginMutation,
  useFetchChangesQuery,
  useMakeChangesMutation,
  useUndoChangesMutation
} = api;
