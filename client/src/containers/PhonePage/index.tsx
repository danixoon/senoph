import React from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

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

export type FilterQuery = Omit<
  PartialNullable<Required<ApiRequest.FetchPhones>>,
  "amount" | "offset"
> & { selectedId: any };

type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const PAGE_ITEMS = 20;

  const { path, url, params } = useRouteMatch();
  const { pathname, search } = useLocation();

  const [offset, setOffset] = React.useState(() => 0);

  const query = qs.parse(search) as FilterQuery;
  const [bindFilter, setFilter] = useQueryInput<FilterQuery>(
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
  const [{ selectedIds /*, isAllSelected  */ }, setSelected] = React.useState(
    () => ({
      selectedIds: new Set<any>(),
      // isAllSelected: false,
    })
  );

  const selectedCount =
    /* isAllSelected
    ? totalItems - selectedIds.length
    : */ selectedIds.size;

  const [isSelectionPopup, setSelectionPopup] = React.useState(() => false);
  const handleSelectionPopup = () => {
    setSelectionPopup(!isSelectionPopup);
  };

  const { ids, exceptIds, ...selectionQuery } = bindFilter.input;

  const [{ isFieldEdit, fieldType, fieldKey }, setFieldEdit] = React.useState<{
    isFieldEdit: boolean;
    fieldType: "text";
    fieldKey: null | string;
  }>(() => ({ isFieldEdit: false, fieldType: "text", fieldKey: null }));

  const [bindField] = useInput({ field: null });

  return (
    <>
      {/* // <PhonePageContext.Provider> */}
      <PopupLayer>
        <PhoneSelectionPopupContainer
          queryBind={bindFilter}
          isOpen={isSelectionPopup}
          onToggle={handleSelectionPopup}
          // isInversed={isAllSelected}
          onSelectionChanged={(ids) =>
            setSelected({ selectedIds: new Set(ids) })
          }
          selectedIds={Array.from(selectedIds)}
          query={denullObject(selectionQuery)}
        />
        <PhonePopupContainer
          selectedId={bindFilter.input.selectedId}
          onToggle={() => handlePhonePopup(null)}
        />
        <FieldEditPopup
          isOpen={isFieldEdit}
          type={fieldType}
          bind={bindField}
          onToggle={() =>
            setFieldEdit({ fieldType, isFieldEdit: false, fieldKey })
          }
        />
      </PopupLayer>
      <TopBarLayer>
        {/* <Layout flow="row"> */}
        <Switch>
          <Route path={`${path}/view`}>
            {/* <Label size="md"> Просмотр средств связи</Label> */}
          </Route>
          <Route path={`${path}/edit`}>
            {/* <Label size="md"> Управление средствами связи</Label> */}
            <Hr vertical />
            <Button
              margin="none"
              color="primary"
              onClick={() =>
                setFieldEdit({ fieldType, fieldKey, isFieldEdit: true })
              }
            >
              <Icon.Plus size="md" />
            </Button>
            <Hr vertical />
            <ButtonGroup>
              <Button
                disabled={selectedCount === 0}
                margin="none"
                onClick={() => handleSelectionPopup()}
              >
                Выбранное
              </Button>
              <Badge margin="none" color="secondary">
                {selectedCount}
              </Badge>
            </ButtonGroup>
          </Route>
        </Switch>
        {/* </Layout> */}
      </TopBarLayer>
      <Layout flow="row">
        <Layout flex="1" style={{ marginLeft: "0.25rem" }}>
          <PhonePage.Items
            selection={{
              onSelection: (/*all,*/ ids) =>
                setSelected({
                  selectedIds: new Set(ids) /* isAllSelected: all */,
                }),
              onSelect: (item) => handlePhonePopup(item.id),
              selectedId: bindFilter.input.selectedId,
              selectionIds: selectedIds,
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
    </>
    // </PhonePageContext.Provider>
  );
};

export default PhonePageContainer;
