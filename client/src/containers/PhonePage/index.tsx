import React from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

import Layout from "components/Layout";
import PhonePage from "layout/PhonePage";
import {
  useFetchFilterConfigQuery,
  useFetchPhonesQuery,
} from "store/slices/api";
import TopBarLayer from "providers/TopBarLayer";
import Label from "components/Label";
import qs from "query-string";
import { useQueryInput } from "hooks/useQueryInput";
import { denullObject } from "utils";
import PopupLayer from "providers/PopupLayer";
import Popup from "components/Popup";
import PhonePopup from "layout/PhonePopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopupContainer from "containers/PhonePopup";

type FilterProps = Omit<
  PartialNullable<Required<ApiRequest.FetchPhones>>,
  "amount" | "offset"
> & { selectedId: any };
type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const PAGE_ITEMS = 20;

  const { path, url, params } = useRouteMatch();
  const { pathname, search } = useLocation();

  const [offset, setOffset] = React.useState(() => 0);

  const query = qs.parse(search) as FilterProps;
  const [bindFilter, setFilter] = useQueryInput<FilterProps>(
    { ...query },
    (key, value, input) => {
      setOffset(0);

      if (key === "phoneTypeId") input.phoneModelId = null;
      return input;
    }
  );

  const filterData = useFilterConfig();
  const { data: itemsData } = useFetchPhonesQuery({
    ...denullObject(bindFilter.input),
    amount: PAGE_ITEMS,
    offset: offset < 0 ? 0 : offset,
    sortKey: bindFilter.input.sortKey ?? undefined,
    sortDir: bindFilter.input.sortDir ?? "asc",
  });

  const totalItems = itemsData?.total ?? PAGE_ITEMS;

  const handlePhonePopup = (id: any = null) => {
    setFilter({ ...bindFilter.input, selectedId: id });
  };

  return (
    <Layout flow="row">
      <Layout flex={1}>
        <Switch>
          <Route path={`${path}/view`}>
            <TopBarLayer>
              <Label size="md">Средства связи</Label>
            </TopBarLayer>
            <PopupLayer>
              <PhonePopupContainer
                selectedId={bindFilter.input.selectedId}
                onToggle={() => handlePhonePopup(null)}
              />
            </PopupLayer>
            <PhonePage.Items
              selection={{
                onSelect: (item) => handlePhonePopup(item.id),
                selectedId: bindFilter.input.selectedId,
              }}
              sorting={{
                dir: bindFilter.input.sortDir ?? "asc",
                key: bindFilter.input.sortKey,
                onSort: (sortKey, sortDir) =>
                  setFilter({ ...bindFilter.input, sortKey, sortDir }),
              }}
              paging={{
                offset,
                onOffsetChanged: (nextOffset) =>
                  setOffset(nextOffset < 0 ? 0 : nextOffset),
                pageItems: PAGE_ITEMS,
                totalItems: totalItems,
              }}
              items={itemsData?.items ?? []}
            />
          </Route>
          <Route path={`${path}/edit`}>
            <TopBarLayer>
              <Label size="md">Управление средствами связи</Label>
            </TopBarLayer>
          </Route>
        </Switch>
      </Layout>
      <Layout style={{ flexBasis: "200px" }}>
        <PhonePage.Filter bind={bindFilter} config={filterData} />
      </Layout>
    </Layout>
  );
};

export default PhonePageContainer;
