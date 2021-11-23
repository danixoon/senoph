import Button from "components/Button";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import Table, { TableColumn } from "components/Table";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { splitHolderName, useHolderName } from "hooks/misc/useHolderName";

import { useFileInput, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { api } from "store/slices/api";

import "./style.styl";

import { Route, Switch, useRouteMatch } from "react-router";
import Badge from "components/Badge";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import InfoBanner from "components/InfoBanner";
import { extractStatus } from "store/utils";
import { useTogglePopup } from "hooks/useTogglePopup";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import ActionBox from "components/ActionBox";
import { useAppDispatch } from "store";
import { push } from "connected-react-router";
import CommitContent from "./Commit";
import ViewContent from "./View";
import CreateContent from "./Create";
import CommitPhoneContent from "./CommitPhone";

export type HoldingItem = Api.Models.Holding & {
  prevHolders: Api.Models.Holder[];
};

export type HoldingPageProps = {
  phones: Api.Models.Phone[];
  holdings: HoldingItem[];
  phonesStatus: ApiStatus;
  holdingsStatus: ApiStatus;
  holdingCreationStatus: ApiStatus;

  onSubmitHolding: (data: any) => void;
};

export type HoldingTableItem = Api.Models.Holding & {
  prevHolders: Api.Models.Holder[];
};

const HoldingPage: React.FC<HoldingPageProps> = (props) => {
  const { phones } = props;

  const { path } = useRouteMatch();

  return (
    <Layout flex="1" className="holding-page">
      <Switch>
        <Route path={`${path}/create`}>
          {phones.length === 0 ? (
            <InfoBanner
              href="/phone/edit"
              hrefContent="средство связи"
              text="Для создания движения выберите"
            />
          ) : (
            <CreateContent {...props} />
          )}
        </Route>
        <Route path={`${path}/commit`}>
          <CommitContent
            {...props}
            holdings={props.holdings.filter((p) => p.status !== null)}
          />
        </Route>
        <Route path={`${path}/view`}>
          <ViewContent {...props} />
        </Route>
        <Route path={`${path}/phone/commit`}>
          <CommitPhoneContent {...props} />
        </Route>
      </Switch>
    </Layout>
  );
};

export default HoldingPage;
