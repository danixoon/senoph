import SideBarContainer from "containers/SideBar";
import PhonePageContainer from "containers/PhonePage";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Layout from "components/Layout";
import TopBarContainer from "containers/TopBar";
import FilterPageLayout from "layout/FilterPageLayout";

export type RootLayoutProps = {};

const RootLayout: React.FC<RootLayoutProps> = (props) => {
  return (
    <>
      <SideBarContainer />
      <Layout flow="column" flex="1">
        <TopBarContainer />
        <Switch>
          <Route path="/phone">
            <PhonePageContainer />
          </Route>
          <Route path="/holding">
            
          </Route>
        </Switch>
      </Layout>
    </>
  );
};

export default RootLayout;
