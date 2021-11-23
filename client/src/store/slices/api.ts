import {
  Api,
  ApiModules,
  CreateApi,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { ObjectFlags } from "typescript";

const convertItem = (item: any) => {
  const converted = { ...item };
  for (let key in converted)
    if (key.endsWith("Date")) converted[key] = new Date(converted[key]);

  return converted;
};

export const api = createApi({
  reducerPath: "api",
  tagTypes: [
    "commit",
    "holder",
    "phone",
    "holding",
    "holdingPhone",
    "holder",
    "category",
    "user",
    "department",
    "phoneType",
    "phoneModel",
    "log",
  ],
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
      providesTags: (r, e, a) =>
        (r?.items ?? []).map((item) => ({ type: "phone", id: item.id })),
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
      providesTags: (r, e, a) => [{ type: "phone", id: a.id }],
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
        "log",
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
      invalidatesTags: (r, e, a) => [{ type: "commit", id: a.target }, "log"],
    }),
    fetchHolders: builder.query<
      Api.GetResponse<"get", "/holders">,
      Api.GetQuery<"get", "/holders">
    >({
      query: (params) => ({
        url: "holders",
        params,
      }),
      providesTags: ["holder"],
    }),
    fetchPhonesCommit: builder.query<
      Api.GetResponse<"get", "/phone/commit">,
      Api.GetQuery<"get", "/phone/commit">
    >({
      query: (params) => ({
        url: "phone/commit",
        params,
      }),
      providesTags: ["phone", "commit"],
    }),
    createPhones: builder.mutation<
      Api.GetResponse<"post", "/phone">,
      Api.GetBody<"post", "/phone">["data"]
    >({
      query: (params) => ({
        url: "phone",
        body: { data: params },
        method: "POST",
      }),
      invalidatesTags: ["phone", "log"],
    }),
    commitPhone: builder.mutation<
      Api.GetResponse<"put", "/commit/phone">,
      Api.GetBody<"put", "/commit/phone">
    >({
      query: (params) => ({
        url: "commit/phone",
        body: params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => ["phone", "commit", "log"],
    }),
    commitChangesApprove: builder.mutation<
      Api.GetResponse<"post", "/commit">,
      Api.GetQuery<"post", "/commit">
    >({
      query: (params) => ({
        url: "commit",
        params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => ["phone", "commit", "log"],
    }),
    commitChangesDecline: builder.mutation<
      Api.GetResponse<"delete", "/commit">,
      Api.GetQuery<"delete", "/commit">
    >({
      query: (params) => ({
        url: "commit",
        params,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, a) => ["phone", "commit", "log"],
    }),
    deletePhone: builder.mutation<
      Api.GetResponse<"delete", "/phone">,
      Api.GetQuery<"delete", "/phone">
    >({
      query: (params) => ({
        url: "phone",
        params,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, a) => ["phone", "commit", "log"],
    }),
    createHolding: builder.mutation<
      Api.GetResponse<"post", "/holding">,
      Api.GetQuery<"post", "/holding"> & {
        body: Api.GetBody<"post", "/holding">;
      }
    >({
      query: (body) => ({
        url: "holding",
        // params,
        method: "POST",
        body,
      }),
      invalidatesTags: (r, e, a) => ["holding", "log"],
    }),
    deleteHolding: builder.mutation<
      Api.GetResponse<"delete", "/holding">,
      Api.GetBody<"delete", "/holding">
    >({
      query: (params) => ({
        url: "holding",
        params,
        method: "DELETE",
      }),
      invalidatesTags: ["holding", "log"],
    }),
    fetchHoldings: builder.query<
      Api.GetResponse<"get", "/holdings">,
      Api.GetQuery<"get", "/holdings">
    >({
      query: (params) => ({
        url: "holdings",
        params,
        method: "GET",
      }),
      providesTags: ["holding"],
    }),
    fetchPhoneHoldings: builder.query<
      Api.GetResponse<"get", "/phone/holdings">,
      Api.GetQuery<"get", "/phone/holdings">
    >({
      query: (params) => ({
        url: "phone/holdings",
        params,
        method: "GET",
      }),
      providesTags: ["holding"],
    }),
    fetchHoldingPhoneCommits: builder.query<
      Api.GetResponse<"get", "/holdings/commit">,
      Api.GetQuery<"get", "/holdings/commit">
    >({
      query: (params) => ({
        url: "holdings/commit",
        params,
        method: "GET",
      }),
      providesTags: ["holding", "holdingPhone"],
    }),
    commitHolding: builder.mutation<
      Api.GetResponse<"put", "/commit/holding">,
      Api.GetBody<"put", "/commit/holding">
    >({
      query: (params) => ({
        url: "commit/holding",
        body: params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => ["holding", "phone", "log"],
    }),
    commitHoldingPhone: builder.mutation<
      Api.GetResponse<"put", "/commit/holding/phone">,
      Api.GetBody<"put", "/commit/holding/phone">
    >({
      query: (params) => ({
        url: "commit/holding/phone",
        body: params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => ["holding", "phone", "log", "holdingPhone"],
    }),
    fetchCategories: builder.query<
      Api.GetResponse<"get", "/categories">,
      Api.GetQuery<"get", "/categories">
    >({
      query: (params) => ({
        url: "categories",
        params,
        method: "GET",
      }),
      providesTags: ["category"],
    }),
    createCategory: builder.mutation<
      Api.GetResponse<"post", "/category">,
      Api.GetBody<"post", "/category">
    >({
      query: (body) => ({
        url: "category",
        body,
        method: "POST",
      }),
      invalidatesTags: ["category", "log"],
    }),
    deleteCategory: builder.mutation<
      Api.GetResponse<"delete", "/category">,
      Api.GetBody<"delete", "/category">
    >({
      query: (params) => ({
        url: "category",
        params,
        method: "DELETE",
      }),
      invalidatesTags: ["category", "log"],
    }),
    commitCategory: builder.mutation<
      Api.GetResponse<"put", "/commit/category">,
      Api.GetBody<"put", "/commit/category">
    >({
      query: (params) => ({
        url: "commit/category",
        body: params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => ["category", "phone", "log"],
    }),
    fetchUsers: builder.query<
      Api.GetResponse<"get", "/accounts">,
      Api.GetQuery<"get", "/accounts">
    >({
      query: (params) => ({
        url: "accounts",
        params,
        method: "GET",
      }),
      providesTags: ["user"],
    }),
    deleteUser: builder.mutation<
      Api.GetResponse<"delete", "/account">,
      Api.GetQuery<"delete", "/account">
    >({
      query: (params) => ({ url: "account", params, method: "DELETE" }),
      invalidatesTags: ["user", "log"],
    }),
    createUser: builder.mutation<
      Api.GetResponse<"post", "/account">,
      Api.GetQuery<"post", "/account">
    >({
      query: (params) => ({ url: "account", params, method: "POST" }),
      invalidatesTags: ["user", "log"],
    }),

    //*****//
    fetchDepartments: builder.query<
      Api.GetResponse<"get", "/departments">,
      Api.GetQuery<"get", "/departments">
    >({
      query: (params) => ({
        url: "departments",
        params,
        method: "GET",
      }),
      providesTags: ["department"],
    }),
    deleteDepartment: builder.mutation<
      Api.GetResponse<"delete", "/department">,
      Api.GetQuery<"delete", "/department">
    >({
      query: (params) => ({ url: "department", params, method: "DELETE" }),
      invalidatesTags: ["department", "log"],
    }),
    createDepartment: builder.mutation<
      Api.GetResponse<"post", "/department">,
      Api.GetQuery<"post", "/department">
    >({
      query: (params) => ({ url: "department", params, method: "POST" }),
      invalidatesTags: ["department", "log"],
    }),
    //*****//
    fetchPhoneTypes: builder.query<
      Api.GetResponse<"get", "/phone/types">,
      Api.GetQuery<"get", "/phone/types">
    >({
      query: (params) => ({
        url: "phone/types",
        params,
        method: "GET",
      }),
      providesTags: ["phoneType"],
    }),
    deletePhoneType: builder.mutation<
      Api.GetResponse<"delete", "/phone/type">,
      Api.GetQuery<"delete", "/phone/type">
    >({
      query: (params) => ({ url: "phone/type", params, method: "DELETE" }),
      invalidatesTags: ["phoneType", "log"],
    }),
    createPhoneType: builder.mutation<
      Api.GetResponse<"post", "/phone/type">,
      Api.GetQuery<"post", "/phone/type">
    >({
      query: (params) => ({ url: "phone/type", params, method: "POST" }),
      invalidatesTags: ["phoneType", "log"],
    }),
    //*****//
    deleteHolder: builder.mutation<
      Api.GetResponse<"delete", "/holder">,
      Api.GetQuery<"delete", "/holder">
    >({
      query: (params) => ({ url: "holder", params, method: "DELETE" }),
      invalidatesTags: ["holder", "log"],
    }),
    createHolder: builder.mutation<
      Api.GetResponse<"post", "/holder">,
      Api.GetQuery<"post", "/holder">
    >({
      query: (params) => ({ url: "holder", params, method: "POST" }),
      invalidatesTags: ["holder", "log"],
    }),
    //*****//
    fetchPhoneModel: builder.query<
      Api.GetResponse<"get", "/phone/models">,
      Api.GetQuery<"get", "/phone/models">
    >({
      query: (params) => ({
        url: "phone/models",
        params,
        method: "GET",
      }),
      providesTags: ["phoneModel"],
    }),
    deletePhoneModel: builder.mutation<
      Api.GetResponse<"delete", "/phone/model">,
      Api.GetQuery<"delete", "/phone/model">
    >({
      query: (params) => ({ url: "phone/model", params, method: "DELETE" }),
      invalidatesTags: ["phoneModel", "log"],
    }),
    createPhoneModel: builder.mutation<
      Api.GetResponse<"post", "/phone/model">,
      Api.GetQuery<"post", "/phone/model">
    >({
      query: (params) => ({
        url: "phone/model",
        body: params,
        method: "POST",
      }),
      invalidatesTags: ["phoneModel", "log"],
    }),
    //*****//
    fetchLogs: builder.query<
      Api.GetResponse<"get", "/logs">,
      Api.GetQuery<"get", "/logs">
    >({
      query: (params) => ({
        url: "logs",
        // params,
        method: "GET",
      }),
      providesTags: ["log"],
    }),
  }),
});

// TODO: Learn how names generated in typescript with prefix fromzzzzzzzzzzzzzzzz user-defined object
// export const {
//   useFetchPhonesQuery,
//   useFetchFilterConfigQuery,
//   useFetchPhoneQuery,
//   useUserLoginMutation,
//   useFetchChangesQuery,
//   useMakeChangesMutation,
//   useUndoChangesMutation,
//   useFetchHoldersQuery,
//   useCreatePhonesMutation,
// } = api;
