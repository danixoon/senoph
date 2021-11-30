import * as React from "react";
import qs from "query-string";
import Layout from "components/Layout";

import PopupLayer from "providers/PopupLayer";

import "./style.styl";

import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from "react-router";
import InfoBanner from "components/InfoBanner";
import CommitContent from "./Commit";
import ViewContent from "./View";
import CreateContent from "./Create";
import CommitPhoneContent from "./CommitPhone";
import ItemSelectionPopup from "layout/Popups/ItemSelectionPopup";
import { useAppDispatch } from "store";
import { parseItems } from "store/utils";
import { api } from "store/slices/api";
import Link from "components/Link";
import Button from "components/Button";
import Icon from "components/Icon";

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

const useContainer = (props: { holdings: Api.Models.Holding[] }) => {
  const { holdings } = props;
  const { path } = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const query = qs.parse(location.search);

  const isId = typeof query.id === "string";

  const ids = isId
    ? holdings.find((holding) => holding.id.toString() === query.id)
        ?.phoneIds ?? []
    : [];

  const phones = parseItems(
    api.useFetchPhonesQuery(
      { ids, amount: ids.length, offset: 0 },
      { skip: ids.length === 0 }
    )
  );

  const [commit] = api.useCreateHoldingChangeMutation();

  return {
    path,
    phones,
    isOpen: isId,
    onToggle: (id?: number) => {
      history.replace({
        search: qs.stringify({ ...query, id }),
      });
    },
    onCommit: (action: "add" | "remove", holdingId: number, phoneId: number) =>
      commit({ action, holdingId, phoneIds: [phoneId] }),
    // onSelect: (id: string) =>
    //   history.replace({
    //     pathname: `/phone/view`,
    //     search: qs.stringify({ selectedId: id }),
    //   }),
  };
};

const HoldingPage: React.FC<HoldingPageProps> = (props) => {
  const { phones, holdings } = props;
  const {
    phones: holdingPhones,
    isOpen,
    onToggle,
    onCommit,
    path,
  } = useContainer({ holdings });

  return (
    <>
      <PopupLayer>
        <ItemSelectionPopup
          isOpen={isOpen}
          onToggle={() => onToggle()}
          header="Прикреплённые средства связи"
          onSelect={(item) => {}}
          status={holdingPhones.status}
          items={holdingPhones.data.items.map((item) => ({
            id: item.id.toString(),
            content: (
              <>
                <Button
                  onClick={() => onCommit("remove")}
                  inverted
                  style={{ marginRight: "1rem" }}
                >
                  <Icon.X />
                </Button>
                <Link href={`/phone/view?selectedId=${item.id}`}>
                  {item.model?.name ?? `#${item.id}`}
                </Link>
              </>
            ),
            name: item.model?.name ?? `#${item.id}`,
          }))}
        />
      </PopupLayer>
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
            <ViewContent {...props} onEdit={(id) => onToggle(id)} />
          </Route>
          <Route path={`${path}/phone/commit`}>
            <CommitPhoneContent {...props} />
          </Route>
        </Switch>
      </Layout>
    </>
  );
};

export default HoldingPage;
