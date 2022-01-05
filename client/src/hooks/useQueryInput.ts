import { push, replace } from "connected-react-router";
import * as React from "react";
import { useDispatch } from "react-redux";
import { InputHook, InputHookPrepare, useInput } from "./useInput";
import qs from "query-string";
import { useLocation } from "react-router";
import assert from "assert";
import { clearObject } from "utils";

type QueryInputHook = {};

const isEqual = (a: any, b: any) => {
  for (const k in a) if (a[k] !== b[k]) return false;
  return true;
};

export const useQueryInput = <T>(
  defaultInput: PartialType<T, string | null>,
  prepare: InputHookPrepare<T> = (i) => i
) => {
  const dispatch = useDispatch();
  const { pathname, search, ...rest } = useLocation();

  const dispatchQuery = (input: PartialType<T, null | string>) => {
    const oldSearch = qs.parse(search);
    const urlSearch = { ...oldSearch, ...input };
    const s = clearObject(urlSearch);

    dispatch(replace({ ...rest, pathname, search: qs.stringify(s) }));
  };

  const [bind, setInput] = useInput<PartialType<T, null | string>>(
    defaultInput as PartialType<T, null | string>,
    (i) => {
      const result = prepare(i);
      if (result) dispatchQuery(result);
      return null;
    }
  );

  React.useEffect(() => {
    // dispatchQuery({ ...qs.parse(search), ...defaultInput });
  }, []);

  React.useEffect(() => {
    const q = prepare(qs.parse(search) as any);
    setInput({ ...q }, true);
  }, [pathname, search]);

  return [
    bind,
    (v: T) => {
      const input = prepare(v);
      if (input) dispatchQuery(input);
      // return setInput(input);
    },
  ] as InputHook<T>;
};
