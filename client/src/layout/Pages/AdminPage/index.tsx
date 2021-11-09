import React from "react";
import { Route, Switch, useRouteMatch } from "react-router";
import Departments from "./Departments";
import Holders from "./Holders";
import Logs from "./Logs";
import PhoneModels from "./PhoneModels";
import PhoneTypes from "./PhoneTypes";

import "./style.styl";
import Users from "./Users";

export type AdminPageProps = {};
const AdminPage: React.FC<AdminPageProps> = (props) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/users`}>
        <Users />
      </Route>
      <Route path={`${path}/holders`}>
        <Holders />
      </Route>
      <Route path={`${path}/departments`}>
        <Departments />
      </Route>
      <Route path={`${path}/phone`}>
        <PhoneTypes />
      </Route>
      <Route path={`${path}/models`}>
        <PhoneModels />
      </Route>
      <Route path={`${path}/logs`}>
        <Logs />
      </Route>
    </Switch>
  );
};

export default AdminPage;
