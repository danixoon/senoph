import React from "react";
import { handleChangeEvent, InputBind } from "./useInput";

export const useStoreQueryInput = <T>(
  query: T,
  updater: (query: Partial<T>) => any
) => {
  const bind: InputBind<T> = {
    input: query,
    onChange: (e) => {
      const input = handleChangeEvent(query, e);
      updater(input);
    },
  };

  return bind;
};
