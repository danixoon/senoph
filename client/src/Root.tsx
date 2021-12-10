import RootLayout from "layout/RootLayout";
import * as React from "react";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import PopupLayerProvider from "./providers/PopupLayerProvider";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import "./stylus/default.styl";
import { store, history } from "store";
import NoticeLayerProvider from "providers/NoticeProvider";

export type RootContainerProps = {};

const queryCache = new QueryCache();

const Root: React.FC<RootContainerProps> = (props) => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ReactQueryCacheProvider queryCache={queryCache}>
            <PopupLayerProvider>
              <NoticeLayerProvider>
                <RootLayout />
              </NoticeLayerProvider>
            </PopupLayerProvider>
          </ReactQueryCacheProvider>
        </ConnectedRouter>
      </Provider>
    </React.StrictMode>
  );
};

export default Root;
