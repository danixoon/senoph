import RootLayout from "layout/RootLayout";
import * as React from "react";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import PopupLayerProvider from "./providers/PopupLayerProvider";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import "./stylus/default.styl";
import { store, history } from "store";

export type RootContainerProps = {};

const queryCache = new QueryCache();

const Root: React.FC<RootContainerProps> = (props) => {
  return (  
  <React.StrictMode>
    <Provider store={store}>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <PopupLayerProvider>
          <ConnectedRouter history={history}>
             <RootLayout />
          </ConnectedRouter>
        </PopupLayerProvider>
      </ReactQueryCacheProvider>
    </Provider>
  </React.StrictMode>
  );
};

export default Root;
