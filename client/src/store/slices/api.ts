import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const convertItems = <T>(res: T[]): T[] => {
  const convertItem = (item: any) => {
    const converted = { ...item };
    for (let key in converted)
      if (key.endsWith("Date")) converted[key] = new Date(converted[key]);

    return converted;
  };

  return res.map(convertItem);
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    fetchPhones: builder.query<ApiResponse.FetchPhones, {}>({
      query: () => "phone",
      // transformResponse: (res: ApiResponse.FetchPhones, meta) => {
      //   if (Array.isArray(res.items))
      //     return { ...res, items: convertItems(res.items) };

      //   return res;
      // },
    }),
  }),
});

// TODO: Learn how names generated in typescript with prefix from user-defined object
export const { useFetchPhonesQuery } = api;
