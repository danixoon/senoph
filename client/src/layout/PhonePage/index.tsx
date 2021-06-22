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
import "./style.styl";

export const Items: React.FC<{
  items: ApiResponse.Phone[];
  bind: InputHook;
}> = (props) => {
  const { items, bind } = props;
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
        {...bind}
        name="phoneId"
        items={items}
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
          { key: "modelId", name: "Ид. Модели", sortable: true },
        ]}
      />
      <Paginator
        onChange={(page) => {
          bind.onChange({ target: { name: "page", value: page } });
        }}
        min={1}
        max={10}
        size={5}
        current={bind.input.page as number}
      />
    </>
  );
};

export const Filter: React.FC<{
  bind: InputHook;
  config: {
    types: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    models: { id: number; name: string; phoneTypeId: number }[];
  };
}> = (props) => {
  const { bind, config } = props;
  // const bind = useInput({ phoneTypeId: 0 });

  const types = config.types.map((type) => ({
    id: type.id,
    label: type.name,
  }));

  const models = config.models
    .filter(
      (model) =>
        model.phoneTypeId.toString() === bind.input.phoneTypeId?.toString()
    )
    .map((model) => ({ id: model.id, label: model.name }));

  const departments = config.departments.map((dep) => ({
    id: dep.id,
    label: dep.name,
  }));

  return (
    <>
      <Header align="right" className="margin_md">
        Фильтрация
      </Header>
      <Form className="filter-content__form">
        <Layout>
          <Input {...bind} name="search" label="Поиск" />
          <Dropdown {...bind} name="phoneTypeId" label="Тип СС" items={types} />
          <Dropdown
            {...bind}
            name="modelId"
            label="Модель СС"
            items={models}
          />
          <Dropdown
            {...bind}
            name="category"
            label="Категория"
            items={[
              { id: 0, label: "1" },
              { id: 1, label: "2" },
              { id: 2, label: "3" },
              { id: 3, label: "4" },
            ]}
          />
          <Dropdown
            {...bind}
            name="departmentId"
            label="Подразделение"
            items={departments}
          />

          <Input {...bind} name="inventoryKey" label="Инвентарный номер" />
          <Input {...bind} name="factoryKey" label="Заводской номер" />

          <Input
            style={{ flex: 1 }}
            {...bind}
            name="accountingDate"
            label="Дата принятия к учёту"
          />
          <Input
            style={{ flex: 1 }}
            {...bind}
            name="assemblyDate"
            label="Дата ввода в эксплуатацию"
          />

          <Input
            {...bind}
            name="ownerName"
            label="Материально-ответственное лицо"
          />
        </Layout>
      </Form>
    </>
  );
};
