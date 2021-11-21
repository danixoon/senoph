import React from "react";
import {
  Route,
  Switch as RouterSwitch,
  useLocation,
  useRouteMatch,
} from "react-router";

import Layout from "components/Layout";
import PhonePage from "layout/Pages/PhonePage";
import { api } from "store/slices/api";
import TopBarLayer from "providers/TopBarLayer";
import qs from "query-string";
import { useQueryInput } from "hooks/useQueryInput";
import { denullObject } from "utils";
import PopupLayer from "providers/PopupLayer";
import { useFetchConfig } from "hooks/api/useFetchConfig";
import PhonePopupContainer from "containers/PhonePopup";
import Icon from "components/Icon";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Hr from "components/Hr";
import Badge from "components/Badge";
import PhoneSelectionPopupContainer from "containers/PhoneSelectionPopup";

import FieldEditPopup from "layout/Popups/FieldEditPopup";
import { useInput } from "hooks/useInput";
// import { PhonePageContext } from "./context";
import { useStoreQueryInput } from "hooks/useStoreQueryInput";
import { useAppDispatch, useAppSelector } from "store";
import { updateFilter, updateSelection } from "store/slices/phone";
import Switch from "components/Switch";
import PhoneCreatePopupContainer from "containers/PhoneCreatePopup";

type PhonePageContainerProps = {};
const PAGE_ITEMS = 15;

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const dispatch = useAppDispatch();
  const { filter, mode, ...rest } = useAppSelector((state) => state.phone);
  const bindFilter = useStoreQueryInput(filter, (q) =>
    dispatch(updateFilter(q))
  );

  const { path, url, params } = useRouteMatch();
  const selectionIdsSet = new Set(rest.selectionIds);

  const filterData = useFetchConfig();
  const { data: itemsData } = api.useFetchPhonesQuery({
    ...denullObject(filter),
    amount: PAGE_ITEMS,
    offset: filter.offset < 0 ? 0 : filter.offset,
    sortKey: filter.sortKey ?? undefined,
    sortDir: filter.sortDir ?? "asc",
  });

  const totalItems = itemsData?.total ?? PAGE_ITEMS;

  const [isSelectionPopup, setSelectionPopup] = React.useState(() => false);
  const handleSelectionPopup = () => {
    setSelectionPopup(!isSelectionPopup);
  };

  const [isCreatePopup, setCreatePopup] = React.useState(() => false);
  const handleCreatePopup = () => {
    setCreatePopup(!isCreatePopup);
  };

  return (
    <>
      <PopupLayer>
        <PhoneSelectionPopupContainer
          isOpen={isSelectionPopup && mode === "edit"}
          onToggle={handleSelectionPopup}
        />
        <PhonePopupContainer />
        <PhoneCreatePopupContainer
          isOpen={isCreatePopup && mode === "edit"}
          onToggle={handleCreatePopup}
        />
      </PopupLayer>
      <TopBarLayer>
        <RouterSwitch>
          {/* <Route path={`${path}/view`}> */}
          {/* <Switch
              name="tab"
              input={{ tab: "filter" }}
              onChange={() => {}}
              items={[
                { id: "filter", name: "Поиск" },
                // { id: "departments", name: "Вид по отделениям" },
              ]}
            /> */}
          {/* </Route> */}
          <Route path={`${path}/edit`}>
            <Hr vertical />
            <Button margin="none" color="primary" onClick={handleCreatePopup}>
              <Icon.Plus size="md" />
            </Button>
            <Hr vertical />
            <ButtonGroup>
              <Button
                disabled={selectionIdsSet.size === 0}
                margin="none"
                onClick={() => handleSelectionPopup()}
              >
                Выбранное
              </Button>
              <Badge margin="none" color="secondary">
                {selectionIdsSet.size}
              </Badge>
            </ButtonGroup>
          </Route>
        </RouterSwitch>
      </TopBarLayer>
      <Layout flow="row">
        <Layout flex="1" style={{ marginLeft: "0.25rem" }}>
          <PhonePage.Items
            selection={{
              onSelection: (/*all,*/ ids) =>
                dispatch(updateSelection({ ids: Array.from(ids) })),
              onSelect: (item) =>
                dispatch(updateFilter({ selectedId: item.id })),
              selectedId: filter.selectedId,
              selectionIds: selectionIdsSet,
            }}
            sorting={{
              dir: filter.sortDir ?? "asc",
              key: filter.sortKey,
              onSort: (sortKey, sortDir) =>
                dispatch(updateFilter({ sortKey, sortDir })),
            }}
            paging={{
              offset: filter.offset,
              onOffsetChanged: (nextOffset) =>
                dispatch(
                  updateFilter({ offset: nextOffset < 0 ? 0 : nextOffset })
                ),
              pageItems: PAGE_ITEMS,
              totalItems: totalItems,
            }}
            items={itemsData?.items ?? []}
            mode={mode}
          />
        </Layout>
        <Hr vertical />
        <Layout style={{ flexBasis: "200px" }}>
          <PhonePage.Filter bind={bindFilter} config={filterData} />
        </Layout>
      </Layout>
    </>
  );
};

export default PhonePageContainer;
