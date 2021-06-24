import { push } from "connected-react-router";
import * as React from "react";
import { useDispatch } from "react-redux";
import { InputHookPrepare, useInput } from "./useInput";
import qs from "query-string";
import { useLocation } from "react-router";


type QueryInputHook = {} 

export const useQueryInput = <T> (defaultInput: T, prepare: InputHookPrepare<T>) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  // console.log(pathname);
  const bind = useInput<T>(defaultInput, (k, v, i) => {
    i = prepare(k, v, i);
    // console.log(i);
    const urlSearch = { ...i };
    for(const key in urlSearch)
      if(urlSearch[key] === null)
        delete urlSearch[key];

    dispatch(push(`${pathname}?${qs.stringify(urlSearch)}`));
    return i;
  });
  return bind;
}