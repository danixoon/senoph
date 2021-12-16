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
import Icon, { LoaderIcon } from "components/Icon";
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
import Paginator from "components/Paginator";
import { usePaginator } from "hooks/usePaginator";
import { useNotice } from "hooks/useNotice";

type PhonePageContainerProps = {};

const DEFAULT_PAGE_ITEMS = 40;

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const dispatch = useAppDispatch();
  const { filter, mode, ...rest } = useAppSelector((state) => state.phone);
  const filterHook = useStoreQueryInput(filter, (q) =>
    // TODO: Избавиться от any
    dispatch(updateFilter(q as any))
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

  useNotice(fetchStatus, {
    error: "Ошибка поиска",
    loading: null,
    success: null,
  });

  const [bind, setBind] = useInput({ items: DEFAULT_PAGE_ITEMS });

  React.useEffect(() => {
    setBind({ items: filter.pageItems });
  }, [filter.pageItems]);

  const handleTotalPageSelection = () => {
    let value = parseInt(
      bind.input.items?.toString() ?? DEFAULT_PAGE_ITEMS.toString()
    );

    if (value < 15) value = 15;
    else if (value > 200) value = 200;

    dispatch(
      updateFilter({
        pageItems: isNaN(value) ? DEFAULT_PAGE_ITEMS : value,
      })
    );
  };

  const { maxPage, currentPage } = usePaginator(
    parseInt(filter.offset.toString()),
    (off) => dispatch(updateFilter({ offset: off })),
    totalItems,
    filter.pageItems
  );
  // if (currentPage > maxPage) currentPage = maxPage;

  // React.useEffect(() => {
  //   if (totalItems > 0) {
  //     if (currentPage > maxPage) {
  //       dispatch(
  //         updateFilter({
  //           offset: Math.max(0, (maxPage - 1) * filter.pageItems),
  //         })
  //       );
  //     }
  //   }
  // }, [filter.offset, totalItems]);

  return (
    <>
      <PopupLayer>
        <PhoneSelectionPopupContainer {...selectionPopup} />
        <PhonePopupContainer />
        <PhoneCreatePopupContainer {...createPopup} />
      </PopupLayer>
      <TopBarLayer>
        <Paginator
          onChange={(page) =>
            dispatch(
              updateFilter({
                offset: (page - 1) * filter.pageItems,
              })
            )
          }
          min={1}
          max={maxPage}
          size={5}
          current={currentPage}
        />
        <Header
          align="center"
          style={{ margin: "auto" }}
          className="margin_md page__header"
        >
          {/* <span style={{ marginRight: "auto" }}> */}
          {fetchStatus.isLoading && (
            <LoaderIcon style={{ marginRight: "0.5rem" }} />
          )}{" "}
          Результаты поиска ({totalItems}){/* </span> */}
        </Header>
        <RouterSwitch>
          <Route path={`${path}/edit`}>
            <ButtonGroup style={{ marginLeft: "auto", marginRight: "1rem" }}>
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
        <Header
          style={{ marginLeft: mode === "view" ? "auto" : 0, marginRight: 0 }}
        >
          Результатов:
        </Header>
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
      <Layout flex="1" flow="row">
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
              totalItems,
            }}
            items={itemsData?.items ?? []}
            mode={mode}
            status={fetchStatus}
          />
        </Layout>
        <Hr vertical />
        <Layout>
          <PhonePage.Filter hook={filterHook} config={filterData} />
        </Layout>
      </Layout>
    </>
  );
};

export default PhonePageContainer;
