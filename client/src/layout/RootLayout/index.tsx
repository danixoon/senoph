import SideBarContainer from "containers/SideBar";
import PhonePageContainer from "containers/PhonePage";
import * as React from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import Layout from "components/Layout";
import TopBarContainer from "containers/TopBar";
import FilterPageLayout from "layout/FilterPageLayout";
import { TopBarContext } from "providers/TopBarLayer";
import Button from "components/Button";
import { updateFilter } from "store/slices/phone";
import { useDispatch } from "react-redux";
import AuthPageContainer from "containers/AuthPage";
import { useAppDispatch, useAppSelector } from "store";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { login } from "store/slices/app";
import { replace } from "connected-react-router";
import CategoryPage from "layout/Pages/_CategoryPage";
import HoldingPageContainer from "containers/HoldingPage";
// import CategoryPageContainer from "containers/CategoryPage";
import AdminPage from "layout/Pages/AdminPage";
import CommitPage from "layout/Pages/_CommitPage";
import "./style.styl";
import Span from "components/Span";

// export type RootLayoutProps = {
//   isLogin?: boolean;
// };

const RootLayout: React.FC<{}> = (props) => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(() => null);
  const topBarRef = React.useCallback((node: HTMLDivElement) => {
    if (node != null) setRef(node);
  }, []);

  const { state, ...currentLocation } = useLocation<any>();

  const dispatch = useAppDispatch();
  const isFirstRender = useIsFirstEffect();
  const { user, token, status } = useAppSelector((state) => state.app);
  const isAuth = user.id !== -1;

  // if (isFirstRender && token) dispatch(fetchAccount({}));
  React.useEffect(() => {
    if (token) dispatch(login(token) as any);
  }, []);

  React.useEffect(() => {
    if (currentLocation.pathname.startsWith("/auth") && status === "success")
      dispatch(replace(state?.referrer ?? "/"));
  }, [isAuth]);

  // const isInitial = token !== null && !isFirstRender;

  return (
    <Switch>
      <Route path="/auth">
        <AuthPageContainer />
      </Route>
      <Route path="*">
        {!isAuth ? (
          <Redirect
            to={{ pathname: "/auth", state: { referrer: currentLocation } }}
          />
        ) : (
          <>
            <SideBarContainer />
            <Layout flow="column" flex="1" className="page-content">
              <TopBarContainer ref={topBarRef} />
              <TopBarContext.Provider value={ref}>
                <Switch>
                  <Route exact path="/">
                    <Layout
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Span> Добро пожаловать, {user.name}! </Span>
                    </Layout>
                  </Route>

                  <Route path="/phone/commit">
                    <CommitPage />
                  </Route>
                  <Route path="/phone">
                    <PhonePageContainer />
                  </Route>
                  <Route path="/holding">
                    <HoldingPageContainer />
                  </Route>
                  <Route path="/category">
                    <CategoryPage />
                  </Route>
                  <Route path="/admin">
                    {user.role === "admin" ? (
                      <AdminPage />
                    ) : (
                      <Redirect to="/" />
                    )}
                  </Route>
                </Switch>
              </TopBarContext.Provider>
            </Layout>
          </>
        )}
      </Route>
    </Switch>
  );
};

export default RootLayout;
