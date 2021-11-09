import * as React from "react";
import { api } from "store/slices/api";

export const useFetchHolder = (
  query: Api.GetQuery<"get", "/holders">,
  isSkip: boolean = false
) => {
  const { data, ...rest } = api.useFetchHoldersQuery(query, { skip: isSkip });
  return { holders: data ?? { items: [], total: 0, offset: 0 }, ...rest };
};

export const useLastHolder = (phone: number | Api.Models.Phone) => {
  let phoneModel: Api.Models.Phone | null = null;

  if (typeof phone === "number") {
    const { data } = api.useFetchPhoneQuery({ id: phone });
    phoneModel = data ?? null;
  }

  const lastHolding = [...(phoneModel?.holdings ?? [])]
    .sort((h1, h2) => ((h1.createdAt ?? 0) > (h2.createdAt ?? 0) ? 1 : -1))
    .shift();

  const fetchHoldersHook = api.useFetchHoldersQuery(
    {
      id: lastHolding?.holderId,
    },
    { skip: phoneModel === null || (phoneModel?.holdings?.length ?? 0) === 0 }
  );

  return {
    ...fetchHoldersHook,
    holder: fetchHoldersHook.data?.items[0] ?? null,
  };
};
