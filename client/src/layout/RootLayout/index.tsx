import SideBarContainer from "containers/SideBar";
import PhonePageContainer from "containers/PhonePage";
import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Layout from "components/Layout";
import TopBarContainer from "containers/TopBar";
import FilterPageLayout from "layout/FilterPageLayout";
import { TopBarContext } from "providers/TopBarLayer";

export type RootLayoutProps = {};

const RootLayout: React.FC<RootLayoutProps> = (props) => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(() => null);
  const topBarRef = React.useCallback((node: HTMLDivElement) => {
    if (node != null) setRef(node);
  }, []);

  return (
    <>
      <SideBarContainer />
      <Layout flow="column" flex="1">
        <TopBarContainer ref={topBarRef} />
        <TopBarContext.Provider value={ref}>
          <Switch>
            <Route path="/phone">
              <PhonePageContainer />
            </Route>
            <Route path="/holding"></Route>
          </Switch>
        </TopBarContext.Provider>
      </Layout>
    </>
  );
};

export default RootLayout;
