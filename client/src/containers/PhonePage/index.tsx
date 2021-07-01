import React from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

import Layout from "components/Layout";
import PhonePage from "layout/PhonePage";
import {
  useFetchPhonesQuery,
} from "store/slices/api";
import TopBarLayer from "providers/TopBarLayer";
import qs from "query-string";
import { useQueryInput } from "hooks/useQueryInput";
import { denullObject } from "utils";
import PopupLayer from "providers/PopupLayer";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import PhonePopupContainer from "containers/PhonePopup";
import Icon from "components/Icon";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Hr from "components/Hr";
import Badge from "components/Badge";

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

  const isEditMode = pathname.startsWith(`${path}/edit`);
  const [selectedCount, setSelectedCound] = React.useState(() => 0);

  return (
    <Layout flow="row">
      <Layout flex="1" style={{ marginLeft: "0.25rem" }}>
        <TopBarLayer>
          {/* <Layout flow="row"> */}
          <Switch>
            <Route path={`${path}/view`}>
              {/* <Label size="md"> Просмотр средств связи</Label> */}
            </Route>
            <Route path={`${path}/edit`}>
              {/* <Label size="md"> Управление средствами связи</Label> */}
              <Hr vertical />
              <Button margin="none" color="primary">
                <Icon.Plus size="md" />
              </Button>
              <Hr vertical />
              <ButtonGroup>
                <Button margin="none">Выбранное</Button>
                <Badge margin="none" color="secondary">
                  {selectedCount}
                </Badge>
              </ButtonGroup>
            </Route>
          </Switch>
          {/* </Layout> */}
        </TopBarLayer>
        <PopupLayer>
          <PhonePopupContainer
            selectedId={bindFilter.input.selectedId}
            onToggle={() => handlePhonePopup(null)}
          />
        </PopupLayer>
        <PhonePage.Items
          selection={{
            onSelection: (all, ids) =>
              setSelectedCound(all ? totalItems - ids.length : ids.length),
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
          mode={isEditMode ? "edit" : "view"}
        />
      </Layout>
      <Hr vertical />
      <Layout style={{ flexBasis: "200px" }}>
        <PhonePage.Filter bind={bindFilter} config={filterData} />
      </Layout>
    </Layout>
  );
};

export default PhonePageContainer;
