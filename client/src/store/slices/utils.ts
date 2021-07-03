import qs from "query-string";
import { ActionReducerMapBuilder, Draft } from "@reduxjs/toolkit";
import {
  LocationChangeAction,
  LOCATION_CHANGE,
  push,
} from "connected-react-router";

export const locationQueryReducer = <T extends { filter: F }, F>(
  path: string,
  builder: ActionReducerMapBuilder<T>,
  middlware?: (state: Draft<T>, action: LocationChangeAction) => void
) =>
  builder.addCase(LOCATION_CHANGE, (state, action: LocationChangeAction) => {
    if (!action.payload.location.pathname.startsWith(path)) return;
    
    const query = qs.parse(action.payload.location.search);
    for (const key in query) {
      (state.filter as any)[key] = query[key];
    }
    if (middlware) middlware(state, action);
  });

export const updateQuery = <T>(query: Partial<T>) =>
  push({ search: qs.stringify(query) });
