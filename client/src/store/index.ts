import { createBrowserHistory } from "history";
import {
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  configureStore,
  createAsyncThunk,
  createSerializableStateInvariantMiddleware,
  EnhancedStore,
  Reducer,
} from "@reduxjs/toolkit";
import { phoneSlice } from "./slices/phone";
import { appSlice } from "./slices/app";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./slices/api";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { noticeSlice } from "./slices/notice";

export const history = createBrowserHistory();
export const reducers = {
  app: appSlice.reducer,
  notice: noticeSlice.reducer,
  phone: phoneSlice.reducer,
  api: api.reducer,
  router: connectRouter<any>(history),
};

// const serializeMiddleware = createSerializableStateInvariantMiddleware({
//   ignoredPaths: ["/api/holding"],
// });

export const store = configureStore({
  reducer: reducers,
  middleware: (middleware) => [
    ...middleware(),
    api.middleware,
    // serializeMiddleware,
    routerMiddleware(history),
  ],
});

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector = <T>(selector: (state: StoreType) => T) =>
  useSelector<StoreType, T>(selector);

setupListeners(store.dispatch);
