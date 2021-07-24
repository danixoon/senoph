import { createBrowserHistory } from "history";
import {
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  configureStore,
  createAsyncThunk,
  EnhancedStore,
  Reducer,
} from "@reduxjs/toolkit";
import { phoneSlice } from "./slices/phone";
import { appSlice } from "./slices/app";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./slices/api";
import { setupListeners } from "@reduxjs/toolkit/dist/query";

export const history = createBrowserHistory();
export const reducers = {
  app: appSlice.reducer,
  phone: phoneSlice.reducer,
  api: api.reducer,
  router: connectRouter<any>(history),
};

export const store = configureStore({
  reducer: reducers,
  middleware: (middleware) => [
    ...middleware(),
    api.middleware,
    routerMiddleware(history),
  ],
});

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector = <T>(selector: (state: StoreType) => T) =>
  useSelector<StoreType, T>(selector);

setupListeners(store.dispatch);
