import * as React from "react";
import {
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
  useFetchHoldersQuery,
} from "store/slices/api";

export const useFetchHolder = (
  query: Api.GetQuery<"get", "/holder">,
  isSkip: boolean = false
) => {
  const { data, ...rest } = useFetchHoldersQuery(query, { skip: isSkip });
  return { holders: data ?? { items: [], total: 0, offset: 0 }, ...rest };
};
