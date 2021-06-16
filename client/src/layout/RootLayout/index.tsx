import SideBarContainer from "containers/SideBar";
import PhonePageContainer from "containers/PhonePage";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

export type RootLayoutProps = {};

const RootLayout: React.FC<RootLayoutProps> = (props) => {
  return (
    <>
      <SideBarContainer />
      <Switch>
        <Route path="/phone">
          <PhonePageContainer />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  );
};

export default RootLayout;
