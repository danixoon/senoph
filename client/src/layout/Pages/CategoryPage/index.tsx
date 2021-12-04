import React from "react";

import Layout from "components/Layout";
import { Route, Switch, useRouteMatch } from "react-router";
import { ViewContent } from "./View";
import { CreateContent } from "./Create";
import { CommitPhoneContent } from "./CommitPhone";
import { CommitContent } from "./Commit";
import { UpdateContent } from "./Update";

import "./style.styl";

const CategoryPage: React.FC<{}> = (props) => {
  const { path } = useRouteMatch();
  return (
    <Layout flex="1" className="category-page">
      <Switch>
        <Route path={`${path}/view`}>
          <ViewContent />
        </Route>
        <Route path={`${path}/commit`}>
          <CommitContent />
        </Route>
        <Route path={`${path}/phone/commit`}>
          <CommitPhoneContent />
        </Route>
        <Route path={`${path}/update`}>
          <UpdateContent />
        </Route>
        <Route path={`${path}/create`}>
          <CreateContent />
        </Route>
      </Switch>
    </Layout>
  );
};

export default CategoryPage;
