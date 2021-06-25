import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const convertItem = (item: any) => {
  const converted = { ...item };
  for (let key in converted)
    if (key.endsWith("Date")) converted[key] = new Date(converted[key]);

  return converted;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    fetchPhones: builder.query<ApiResponse.FetchPhones, ApiRequest.FetchPhones>(
      {
        query: (params) => ({ url: "phone", params }),
      }
    ),
    fetchPhone: builder.query<ApiResponse.FetchPhone, ApiRequest.FetchPhone>({
      query: (params) => ({ url: "phone/byId", params }),
      // transformResponse: (query, meta) => {
      // return r.
      // },
    }),
    fetchFilterConfig: builder.query<ApiResponse.FetchFilterConfig, {}>({
      query: () => "filter",
    }),
  }),
});

// TODO: Learn how names generated in typescript with prefix from user-defined object
export const {
  useFetchPhonesQuery,
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
} = api;
