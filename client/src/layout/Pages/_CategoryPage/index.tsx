import React from "react";

import Header from "components/Header";
import Layout from "components/Layout";
import Table, { TableColumn } from "components/Table";
import Hr from "components/Hr";
import { Route, Switch, useRouteMatch } from "react-router";
import { api } from "store/slices/api";
import { extractStatus, parseItems, parseQuery } from "store/utils";
import ActionBox from "components/ActionBox";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import { useInput } from "hooks/useInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import { clearObject, getLocalDate } from "utils";
import { defaultColumns as phonePageColumns } from "../PhonePage/Items";
import Checkbox from "components/Checkbox";
import TopBarLayer from "providers/TopBarLayer";
import ButtonGroup from "components/ButtonGroup";
import Button from "components/Button";
import Badge from "components/Badge";
import Icon, { LoaderIcon } from "components/Icon";
import { useNotice } from "hooks/useNotice";
import Span from "components/Span";
import { ViewContent } from "./View";
import { CreateContent } from "./Create";

const CategoryPage: React.FC<{}> = (props) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/view`}>
        <ViewContent />
      </Route>
      <Route path={`${path}/create`}>
        <CreateContent />
      </Route>
    </Switch>
  );
};

export default CategoryPage;
