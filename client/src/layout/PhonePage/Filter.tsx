
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

const Filter: React.FC<{
  bind: InputHook;
  config: {
    types: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    models: { id: number; name: string; phoneTypeId: number }[];
  };
}> = (props) => {
  const { bind, config } = props;

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
            name="phoneModelId"
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

export default Filter;