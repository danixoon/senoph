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

import { connectRouter, routerMiddleware } from "connected-react-router";
import { useDispatch } from "react-redux";
import { api } from "./slices/api";
import { setupListeners } from "@reduxjs/toolkit/dist/query";

export const history = createBrowserHistory();
export const reducers = {
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

setupListeners(store.dispatch);
