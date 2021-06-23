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
  totalItems: number;
  pageItems: number;
  onOffsetChanged: (offset: number) => void;
  offset: number;
}> = (props) => {
  const { items,  totalItems, pageItems, onOffsetChanged, offset} = props;
  const maxPage = Math.floor(totalItems / pageItems);
  const currentPage = Math.ceil((offset + pageItems) / totalItems * maxPage);
  return (
    <>
      <Header align="right" className="margin_md">
        Результаты поиска
      </Header>
      <PopupLayer>
        <Popup size="lg" closeable onToggle={() => {}}>
          hey
        </Popup>
      </PopupLayer>
      <Table
        // {...bind}
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
        max={maxPage + 1}
        size={5}
        current={currentPage}
      />
    </>
  );
};


export default Items;