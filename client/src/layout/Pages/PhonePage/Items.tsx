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
  items: Api.Models.Phone[];
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
    onSelect: (item: Api.Models.Phone) => void;
    onSelection: (/*all: boolean, */ ids: Set<any>) => void;
    selectionIds: Set<any>;
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

  const handleTableSelection = (markedIds: Set<any>) => {
    if (props.mode === "edit") selection.onSelection(markedIds);
  };

  const isSelected = (id: any) => {
    return selection.selectionIds.has(id);
  };

  let isAllSelected = totalItems !== 0;

  const tableItems = items.map((item) => {
    const selected = isSelected(item.id);
    if (!selected) isAllSelected = false;
    return {
      ...item,
      selected,
    };
  });

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
          input={{ selectAll: isAllSelected }}
          onChange={(e) => {
            const set = new Set(selection.selectionIds);
            for (const item of items)
              if (!isAllSelected) set.add(item.id);
              else set.delete(item.id);

            handleTableSelection(set);
          }}
        />
      ),
      type: "checkbox",
      onToggle: (state: boolean, id: any) => {
        const set = new Set(selection.selectionIds);

        if (state) set.add(id);
        else set.delete(id);

        handleTableSelection(set);
      },
    });

  return (
    <>
      <Header
        hr
        align="right"
        className="margin_md"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Paginator
          onChange={(page) => onOffsetChanged((page - 1) * pageItems)}
          min={1}
          max={maxPage}
          size={5}
          current={currentPage}
        />
        <span style={{ marginLeft: "auto" }}>
          Результаты поиска ({totalItems})
        </span>
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
    </>
  );
};

export default Items;