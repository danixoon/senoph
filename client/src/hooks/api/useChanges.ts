import * as React from "react";
import {
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
  useFetchPhonesQuery,
  useFetchChangesQuery,
} from "store/slices/api";

export const useChanges = <T extends ChangesTargetName>(target: T) => {
  const { data } = useFetchChangesQuery({ target });
  return [data ?? {}] as const;
};
