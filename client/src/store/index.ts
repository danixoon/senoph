import { createBrowserHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { phoneSlice } from "./slices/phone";

import { connectRouter, routerMiddleware } from "connected-react-router";

export const history = createBrowserHistory();
export const store = configureStore({
  reducer: {
    phone: phoneSlice.reducer,
    router: connectRouter<any>(history),
  },
  middleware: (middleware) => [...middleware(), routerMiddleware(history)],
});
