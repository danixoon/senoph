import Checkbox from "components/Checkbox";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Layout from "components/Layout";
import Paginator from "components/Paginator";
import Popup from "components/Popup";
import Table, { TableColumn } from "components/Table";
import { InputHook, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { PhoneState } from "store/slices/phone";

const Items: React.FC<{
  items: ApiResponse.Phone[];
  paging: {
    totalItems: number;
    pageItems: number;
    onOffsetChanged: (offset: number) => void;
    offset: number;
  };
  sorting: {
    onSort: (key: string, dir: SortDir) => void;
    dir: SortDir;
    key: string | null;
  };
  selection: {
    onSelect: (item: ApiResponse.Phone) => void;
    onSelection: (all: boolean, ids: any[]) => void;
    selectedId: any;
  };
  mode: "edit" | "view";
}> = (props) => {
  const { items, paging, sorting, selection, mode } = props;

  const { totalItems, pageItems, offset, onOffsetChanged } = paging;
  const { onSelect, selectedId } = selection;

  const maxPage = Math.ceil(totalItems / pageItems);
  let currentPage = Math.floor((offset / totalItems) * maxPage) + 1;
  if (Number.isNaN(currentPage)) currentPage = 1;

  const [
    { markedIds: markedIds, selectAll },
    setTableSelection,
  ] = React.useState<{
    markedIds: Set<any>;
    selectAll: boolean;
  }>(() => ({
    selectAll: false,
    markedIds: new Set(),
  }));

  const handleTableSelection = (
    nextSelectAll: boolean,
    nextMarkedIds?: Set<any>
  ) => {
    const set = new Set(nextMarkedIds);
    setTableSelection({
      markedIds: set,
      selectAll: nextSelectAll,
    });
    if (props.mode === "edit")
      selection.onSelection(nextSelectAll, Array.from(set));
  };

  const isSelected = (id: any) => {
    if (selectAll) return !markedIds.has(id);
    else return markedIds.has(id);
  };

  const tableItems = items.map((item) => ({
    ...item,
    selected: isSelected(item.id),
  }));

  const columns: TableColumn[] = [
    { key: "id", header: "Ид.", sortable: true },
    {
      key: "inventoryKey",
      header: "Инвентарный номер",
      sortable: true,
    },
    { key: "factoryKey", header: "Заводской номер", sortable: true },
    {
      key: "assemblyDate",
      type: "date",
      header: "Дата сборки",
      sortable: true,
    },
    {
      key: "accountingDate",
      type: "date",
      header: "Дата учёта",
      sortable: true,
    },
    {
      key: "commissioningDate",
      type: "date",
      header: "Дата ввода в эксплуатацию",
      sortable: true,
    },
    { key: "modelName", header: "Модель", sortable: true },
  ];

  if (mode === "edit")
    columns.push({
      key: "selected",
      header: (
        <Checkbox
          name="selectAll"
          input={{ selectAll }}
          onChange={(e) => {
            const next = !selectAll;
            handleTableSelection(next);
          }}
        />
      ),
      type: "checkbox",
      onToggle: (state: boolean, id: any) => {
        if (!state) {
          if (selectAll) markedIds.add(id);
          else markedIds.delete(id);
        } else {
          if (selectAll) markedIds.delete(id);
          else markedIds.add(id);
        }

        handleTableSelection(selectAll, new Set(markedIds));
      },
    });

  return (
    <>
      <Header hr align="right" className="margin_md">
        Результаты поиска ({totalItems})
      </Header>
      <PopupLayer>
        <Popup size="lg" closeable onToggle={() => {}}>
          hey
        </Popup>
      </PopupLayer>
      <Table
        // {...bind}
        selectedId={selectedId}
        onSelect={onSelect}
        onSort={sorting.onSort}
        sortDir={sorting.dir}
        sortKey={sorting.key ?? undefined}
        name="phoneId"
        items={tableItems.map((item) => ({
          ...item,
          modelName: item.model?.name,
        }))}
        columns={columns}
      />
      <Paginator
        onChange={(page) => onOffsetChanged((page - 1) * pageItems)}
        min={1}
        max={maxPage}
        size={5}
        current={currentPage}
      />
    </>
  );
};

export default Items;
