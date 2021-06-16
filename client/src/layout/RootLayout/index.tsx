import SideBarContainer from "containers/SideBar";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

export type RootLayoutProps = {};

const RootLayout: React.FC<RootLayoutProps> = (props) => {
  return (
    <>
      <SideBarContainer />
      <Switch>
        <Route path="/">
          what??
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  );
};

export default RootLayout;
