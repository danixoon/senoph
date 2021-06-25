import { push } from "connected-react-router";
import * as React from "react";
import { useDispatch } from "react-redux";
import { InputHook, InputHookPrepare, useInput } from "./useInput";
import qs from "query-string";
import { useLocation } from "react-router";

type QueryInputHook = {};

export const useQueryInput = <T>(
  defaultInput: T,
  prepare: InputHookPrepare<T>
) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

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
  return [
    bind,
    (v: T) => {
      dispatchQuery(v);
      return setInput(v);
    },
  ] as InputHook<T>;
};
