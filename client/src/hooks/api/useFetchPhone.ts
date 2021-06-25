import * as React from "react";
import {
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
  useFetchPhonesQuery,
} from "store/slices/api";

export const useFetchPhone = (id: number | null) => {
  const { data } = useFetchPhoneQuery(
    { id: id as number },
    { skip: id == null }
  );
  return { phone: data ?? null };
};
