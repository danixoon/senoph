import React from "react";
import {
  Route,
  Switch as RouterSwitch,
  useLocation,
  useRouteMatch,
} from "react-router";

import Layout from "components/Layout";
import PhonePage from "layout/PhonePage";
import { useFetchPhonesQuery } from "store/slices/api";
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
import PhoneSelectionPopupContainer from "containers/PhoneSelectionPopup";
import { usePopup } from "hooks/usePopup";
import FieldEditPopup from "layout/FieldEditPopup";
import { useInput } from "hooks/useInput";
import { PhonePageContext } from "./context";
import { useStoreQueryInput } from "hooks/useStoreQueryInput";
import { useAppDispatch, useAppSelector } from "store";
import { updateFilter, updateSelection } from "store/slices/phone";
import Switch from "components/Switch";

export type FilterQuery = Omit<
  PartialNullable<Required<ApiRequest.FetchPhones>>,
  "amount" | "offset"
> & { selectedId: any };

type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const PAGE_ITEMS = 20;

  const dispatch = useAppDispatch();
  const { filter, mode, ...rest } = useAppSelector((state) => state.phone);
  const bindFilter = useStoreQueryInput(filter, (q) =>
    dispatch(updateFilter(q))
  );

  const { path, url, params } = useRouteMatch();
  const selectionIdsSet = new Set(rest.selectionIds);
  // const { pathname, search } = useLocation();

  // const [offset, setOffset] = React.useState(() => 0);

  // const query = qs.parse(search) as FilterQuery;
  // const [bindFilter, setFilter] = useQueryInput<FilterQuery>(
  //   { ...query },
  //   (key, value, input) => {
  //     setOffset(0);

  //     if (key === "phoneTypeId") input.phoneModelId = null;
  //     return input;
  //   }
  // );

  const filterData = useFilterConfig();
  const { data: itemsData } = useFetchPhonesQuery({
    ...denullObject(filter),
    amount: PAGE_ITEMS,
    offset: filter.offset < 0 ? 0 : filter.offset,
    sortKey: filter.sortKey ?? undefined,
    sortDir: filter.sortDir ?? "asc",
  });

  const totalItems = itemsData?.total ?? PAGE_ITEMS;

  // const handlePhonePopup = (id: any = null) => {
  //   updateFilter({ selectedId: id });
  // };

  // const [{ selectedIds /*, isAllSelected  */ }, setSelected] = React.useState(
  //   () => ({
  //     selectedIds: new Set<any>(),
  //     // isAllSelected: false,
  //   })
  // );

  // const selectedCount =
  //   /* isAllSelected
  //   ? totalItems - selectedIds.length
  //   : */ selectedIds.size;

  const [isSelectionPopup, setSelectionPopup] = React.useState(() => false);
  const handleSelectionPopup = () => {
    setSelectionPopup(!isSelectionPopup);
  };

  // const { ids, exceptIds, ...selectionQuery } = query;


  return (
    <>
      {/* // <PhonePageContext.Provider> */}
      <PopupLayer>
        <PhoneSelectionPopupContainer
          isOpen={isSelectionPopup && mode === "edit"}
          onToggle={handleSelectionPopup}
        />
        <PhonePopupContainer />
       
      </PopupLayer>
      <TopBarLayer>
        {/* <Layout flow="row"> */}
        <RouterSwitch>
          <Route path={`${path}/view`}>
            <Switch
              name="tab"
              input={{ tab: "filter" }}
              onChange={() => {}}
              items={[
                { id: "filter", name: "Поиск" },
                { id: "departments", name: "Вид по отделениям" },
              ]}
            />
          </Route>
          <Route path={`${path}/edit`}>
            <Hr vertical />
            <Button margin="none" color="primary">
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
        {/* </Layout> */}
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
    // </PhonePageContext.Provider>
  );
};

export default PhonePageContainer;
