import { InputHook } from "hooks/useInput";
import { useQueryInput } from "hooks/useQueryInput";
import React from "react";

export type QueryState = Omit<
  PartialNullable<
    Required<ApiRequest.FetchPhones> & { selectedId: any; page: number }
  >,
  "amount" | "offset"
>;
export type PhonePageState = {
  queryHook: InputHook<QueryState>;
  // offset:
};
export const PhonePageContext = React.createContext<PhonePageState>({
  queryHook: useQueryInput<QueryState>({
    category: null,
    departmentId: null,
    exceptIds: [],
    factoryKey: null,
    ids: [],
    inventoryKey: null,
    page: null,
    phoneModelId: null,
    phoneTypeId: null,
    search: null,
    selectedId: null,
    sortDir: null,
    sortKey: null,
  }),
});
