import { push } from "connected-react-router";
import * as React from "react";
import { useDispatch } from "react-redux";
import { InputHook, InputHookPrepare, useInput } from "./useInput";
import qs from "query-string";
import { useLocation } from "react-router";
import assert from "assert";

type QueryInputHook = {};

const isEqual = (a: any, b: any) => {
  for (const k in a) if (a[k] !== b[k]) return false;
  return true;
};

export const useQueryInput = <T>(
  defaultInput: T,
  prepare: InputHookPrepare<T> = (k, v, i) => i
) => {
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();

  const dispatchQuery = (input: T) => {
    const urlSearch = { ...input };
    for (const key in urlSearch)
      if (urlSearch[key] === null) delete urlSearch[key];

    dispatch(push(`${pathname}?${qs.stringify(urlSearch)}`));
  };

  const [bind, setInput] = useInput<T>(defaultInput, (k, v, i) => {
    i = prepare(k, v, i);
    dispatchQuery(i);
    return i;
  });

  React.useEffect(() => {
    const q = qs.parse(search) as any;
    if (!isEqual(q, bind.input)) {
      console.log("oh..");
      setInput({ ...q });
    }
  }, [pathname, search]);

  return [
    bind,
    (v: T) => {
      dispatchQuery(v);
      return setInput(v);
    },
  ] as InputHook<T>;
};
