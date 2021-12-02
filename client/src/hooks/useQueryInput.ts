import { push } from "connected-react-router";
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
  prepare: InputHookPrepare<T> = (k, v, i) => i
) => {
  const dispatch = useDispatch();
  const { pathname, search, ...rest } = useLocation();

  const dispatchQuery = (input: PartialType<T, null | string>) => {
    const urlSearch = { ...input };
    const search = clearObject(urlSearch);

    dispatch(push({ ...rest, pathname, search: qs.stringify(search) }));
  };

  const [bind, setInput] = useInput<PartialType<T, null | string>>(
    defaultInput as PartialType<T, null | string>,
    (k, v, i) => {
      i = prepare(k, v, i);
      dispatchQuery(i);
      return i;
    }
  );

  React.useEffect(() => {
    const q = qs.parse(search) as any;
    if (!isEqual(q, bind.input)) setInput({ ...q });
  }, [pathname, search]);

  return [
    bind,
    (v: T) => {
      dispatchQuery(v);
      return setInput(v);
    },
  ] as InputHook<T>;
};
