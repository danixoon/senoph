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

const tagTypes = [
  "commit",
  "holder",
  "phone",
  "holding",
  "holdingPhone",
  "categoryPhone",
  "holder",
  "category",
  "placement",
  "user",
  "department",
  "phoneType",
  "phoneModel",
  "log",
  "backup",
] as const;

// api.

export const api = createApi({
  reducerPath: "api",
  tagTypes,
  keepUnusedDataFor: 5,
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
    createHoldingChange: builder.mutation<
      Api.GetResponse<"put", "/holding">,
      Api.GetQuery<"put", "/holding">
    >({
      query: (params) => ({
        url: "holding",
        params,
        method: "PUT",
        // body,
      }),
      invalidatesTags: (r, e, a) => ["holding", "phone", "log"],
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
    fetchPhonesFromHolding: builder.query<
      Api.GetResponse<"get", "/holding/phones">,
      Api.GetQuery<"get", "/holding/phones">
    >({
      query: (params) => ({
        url: "holding/phones",
        params,
        method: "GET",
      }),
      providesTags: ["holding", "phone", "holdingPhone"],
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
    createCategoryChange: builder.mutation<
      Api.GetResponse<"put", "/category">,
      Api.GetQuery<"put", "/category">
    >({
      query: (params) => ({
        url: "category",
        params,
        method: "PUT",
        // body,
      }),
      invalidatesTags: (r, e, a) => ["category", "phone", "log"],
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
    commitCategoryPhone: builder.mutation<
      Api.GetResponse<"put", "/commit/category/phone">,
      Api.GetBody<"put", "/commit/category/phone">
    >({
      query: (params) => ({
        url: "commit/category/phone",
        body: params,
        method: "PUT",
      }),
      invalidatesTags: (r, e, a) => [
        "category",
        "phone",
        "log",
        "categoryPhone",
      ],
    }),
    fetchCategoryPhoneCommits: builder.query<
      Api.GetResponse<"get", "/categories/commit">,
      Api.GetQuery<"get", "/categories/commit">
    >({
      query: (params) => ({
        url: "categories/commit",
        params,
        method: "GET",
      }),
      providesTags: ["category", "categoryPhone"],
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
    editUser: builder.mutation<
      Api.GetResponse<"put", "/account">,
      Api.GetQuery<"put", "/account">
    >({
      query: (params) => ({ url: "account", params, method: "PUT" }),
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
      providesTags: ["department", "placement"],
    }),
    deleteDepartment: builder.mutation<
      Api.GetResponse<"delete", "/department">,
      Api.GetQuery<"delete", "/department">
    >({
      query: (params) => ({ url: "department", params, method: "DELETE" }),
      invalidatesTags: ["department", "log"],
    }),
    editDepartment: builder.mutation<
      Api.GetResponse<"put", "/department">,
      Api.GetQuery<"put", "/department">
    >({
      query: (params) => ({ url: "department", params, method: "PUT" }),
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
    fetchPlacements: builder.query<
      Api.GetResponse<"get", "/placements">,
      Api.GetQuery<"get", "/placements">
    >({
      query: (params) => ({
        url: "placements",
        params,
        method: "GET",
      }),
      providesTags: ["placement"],
    }),
    deletePlacement: builder.mutation<
      Api.GetResponse<"delete", "/placement">,
      Api.GetQuery<"delete", "/placement">
    >({
      query: (params) => ({ url: "placement", params, method: "DELETE" }),
      invalidatesTags: ["placement", "log", "department"],
    }),
    editPlacement: builder.mutation<
      Api.GetResponse<"put", "/placement">,
      Api.GetQuery<"put", "/placement">
    >({
      query: (params) => ({ url: "placement", params, method: "PUT" }),
      invalidatesTags: ["placement", "log"],
    }),
    createPlacement: builder.mutation<
      Api.GetResponse<"post", "/placement">,
      Api.GetQuery<"post", "/placement">
    >({
      query: (params) => ({ url: "placement", params, method: "POST" }),
      invalidatesTags: ["placement", "log"],
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
    editPhoneType: builder.mutation<
      Api.GetResponse<"put", "/phone/type">,
      Api.GetQuery<"put", "/phone/type">
    >({
      query: (params) => ({ url: "phone/type", params, method: "PUT" }),
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
    editHolder: builder.mutation<
      Api.GetResponse<"put", "/holder">,
      Api.GetQuery<"put", "/holder">
    >({
      query: (params) => ({ url: "holder", params, method: "PUT" }),
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
    editPhoneModel: builder.mutation<
      Api.GetResponse<"put", "/phone/model">,
      Api.GetQuery<"put", "/phone/model"> & {
        details: {
          type: DB.PhoneModelDetailType;
          name: string;
          amount: number;
          units: string;
        }[];
      }
    >({
      query: ({ details, ...params }) => ({
        url: "phone/model",
        params,
        body: { details },
        method: "PUT",
      }),
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
        params,
        method: "GET",
      }),
      providesTags: ["log"],
    }),
    //*****//
    fetchBackups: builder.query<
      Api.GetResponse<"get", "/admin/backups">,
      Api.GetQuery<"get", "/admin/backups">
    >({
      query: (params) => ({
        url: "admin/backups",
        params,
        method: "GET",
      }),
      providesTags: ["backup"],
    }),
    importBackup: builder.mutation<
      Api.GetResponse<"post", "/admin/backup/import">,
      { body: Api.GetBody<"post", "/admin/backup/import"> } & Api.GetQuery<
        "post",
        "/admin/backup/import"
      >
    >({
      query: ({ unsafe, body }) => ({
        url: "admin/backup/import",
        method: "POST",
        params: { unsafe },
        body,
      }),
      invalidatesTags: (r, e, a) => ["backup", "log"],
    }),
    createBackup: builder.mutation<
      Api.GetResponse<"post", "/admin/backup">,
      Api.GetQuery<"post", "/admin/backup">
    >({
      query: (params) => ({
        url: "admin/backup",
        params,
        method: "POST",
      }),
      invalidatesTags: ["backup"],
    }),
    revertBackup: builder.mutation<
      Api.GetResponse<"post", "/admin/backup/revert">,
      Api.GetQuery<"post", "/admin/backup/revert">
    >({
      query: (params) => ({
        url: "admin/backup/revert",
        params,
        method: "POST",
      }),
      invalidatesTags: tagTypes,
    }),
    removeBackup: builder.mutation<
      Api.GetResponse<"delete", "/admin/backup">,
      Api.GetQuery<"delete", "/admin/backup">
    >({
      query: (params) => ({
        url: "admin/backup",
        params,
        method: "DELETE",
      }),
      invalidatesTags: ["backup"],
    }),
    fetchNotice: builder.query<
      Api.GetResponse<"get", "/notice">,
      Api.GetQuery<"get", "/notice">
    >({
      query: (params) => ({
        url: "notice",
        params,
        method: "GET",
      }),
      providesTags: tagTypes,
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
