import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Layout from "components/Layout";
import Paginator from "components/Paginator";
import Popup from "components/Popup";
import Table from "components/Table";
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
    selectedId: any;
  };
}> = (props) => {
  const { items, paging, sorting, selection } = props;

  const { totalItems, pageItems, offset, onOffsetChanged } = paging;
  const { onSelect, selectedId } = selection;

  const maxPage = Math.ceil(totalItems / pageItems);
  let currentPage = Math.floor((offset / totalItems) * maxPage) + 1;
  if (Number.isNaN(currentPage)) currentPage = 1;

  return (
    <>
      <Header align="right" className="margin_md">
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
        items={items.map((item) => ({ ...item, modelName: item.model?.name }))}
        columns={[
          { key: "id", name: "Ид.", sortable: true },
          {
            key: "inventoryKey",
            name: "Инвентарный номер",
            sortable: true,
          },
          { key: "factoryKey", name: "Заводской номер", sortable: true },
          {
            key: "assemblyDate",
            type: "date",
            name: "Дата сборки",
            sortable: true,
          },
          {
            key: "accountingDate",
            type: "date",
            name: "Дата учёта",
            sortable: true,
          },
          {
            key: "commissioningDate",
            type: "date",
            name: "Дата ввода в эксплуатацию",
            sortable: true,
          },
          { key: "modelName", name: "Модель", sortable: true },
        ]}
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
