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
import { extractStatus } from "store/utils";
import { useTogglePopup } from "hooks/useTogglePopup";
import { NoticeContext } from "providers/NoticeProvider";
import Input from "components/Input";
import Span from "components/Span";
import Header from "components/Header";

type PhonePageContainerProps = {};

const DEFAULT_PAGE_ITEMS = 40;

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const dispatch = useAppDispatch();
  const { filter, mode, ...rest } = useAppSelector((state) => state.phone);
  const filterHook = useStoreQueryInput(filter, (q) =>
    dispatch(updateFilter(q))
  );

  const { path, url, params } = useRouteMatch();
  const selectionIdsSet = new Set(rest.selectionIds);

  const filterData = useFetchConfig();

  // const [pageItems, setPageItems] = React.useState(() => DEFAULT_PAGE_ITEMS);

  const { data: itemsData, ...fetchPhones } = api.useFetchPhonesQuery({
    ...denullObject(filter),
    amount: filter.pageItems,
    offset: filter.offset < 0 ? 0 : filter.offset,
    sortKey: filter.sortKey ?? undefined,
    sortDir: filter.sortDir ?? "asc",
  });

  const totalItems = itemsData?.total ?? 0;

  const selectionPopup = useTogglePopup(mode === "edit");
  const createPopup = useTogglePopup(mode === "edit");

  const fetchStatus = extractStatus(fetchPhones, true);
  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (fetchStatus.isError) {
      noticeContext.createNotice(
        `Ошибка поиска (${fetchStatus.error?.name}): ${fetchStatus.error?.description}`
      );
    }
  }, [fetchStatus.status]);

  const [bind, setBind] = useInput({ items: DEFAULT_PAGE_ITEMS });

  React.useEffect(() => {
    setBind({ items: filter.pageItems });
  }, [filter.pageItems]);

  const handleTotalPageSelection = () => {
    let value = parseInt(
      bind.input.items?.toString() ?? DEFAULT_PAGE_ITEMS.toString()
    );

    if (value <= 0) value = 1;
    else if (value >= 200) value = 200;

    dispatch(
      updateFilter({
        pageItems: isNaN(value) ? DEFAULT_PAGE_ITEMS : value,
      })
    );
  };

  return (
    <>
      <PopupLayer>
        <PhoneSelectionPopupContainer {...selectionPopup} />
        <PhonePopupContainer />
        <PhoneCreatePopupContainer {...createPopup} />
      </PopupLayer>
      <TopBarLayer>
        <RouterSwitch>
          <Route path={`${path}/edit`}>
            <Hr vertical />
            <Button
              margin="none"
              color="primary"
              onClick={() => createPopup.onToggle()}
            >
              <Icon.Plus size="md" />
            </Button>
            <Hr vertical />
            <ButtonGroup>
              <Button
                disabled={selectionIdsSet.size === 0}
                margin="none"
                onClick={() => selectionPopup.onToggle()}
              >
                Выбранное
              </Button>
              <Badge margin="none" color="secondary">
                {selectionIdsSet.size}
              </Badge>
            </ButtonGroup>
          </Route>
        </RouterSwitch>
        <Header style={{ margin: "auto", marginRight: 0 }}>Результатов:</Header>
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Space")
              handleTotalPageSelection();
          }}
          onBlur={(e) => {
            handleTotalPageSelection();
          }}
          {...bind}
          style={{ margin: 0, maxWidth: "50px" }}
          name="items"
          placeholder="12"
          type="number"
        />
      </TopBarLayer>
      <Layout flow="row">
        <Layout
          flex="1"
          style={{ marginLeft: "0.25rem", position: "relative" }}
        >
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
              pageItems: filter.pageItems,
              totalItems,
            }}
            items={itemsData?.items ?? []}
            mode={mode}
            status={fetchStatus}
          />
        </Layout>
        <Hr vertical />
        <Layout style={{ flexBasis: "200px" }}>
          <PhonePage.Filter hook={filterHook} config={filterData} />
        </Layout>
      </Layout>
    </>
  );
};

export default PhonePageContainer;
