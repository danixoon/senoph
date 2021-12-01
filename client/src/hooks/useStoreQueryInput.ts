import React from "react";
import { handleChangeEvent, InputBind, InputHook } from "./useInput";

export const useStoreQueryInput = <T>(
  query: T,
  updater: (query: Partial<Record<keyof T, string>>) => any
) => {
  const bind: InputBind<T> = {
    input: query,
    onChange: (e) => {
      const input = handleChangeEvent(query, e);
      updater(input);
    },
  };

  return [bind, updater] as InputHook<T>;
};
