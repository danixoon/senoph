import React from "react";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Layout from "components/Layout";
import { InputBind } from "hooks/useInput";

const Filter: React.FC<{
  bind: InputBind;
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
      <Form className="filter-content__form" input={bind.input}>
        <Layout>
          <Input {...bind} name="search" label="Запрос" />
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
              { id: 1, label: "1" },
              { id: 2, label: "2" },
              { id: 3, label: "3" },
              { id: 4, label: "4" },
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
            name="holderId"
            label="Материально-ответственное лицо"
          />
        </Layout>
      </Form>
    </>
  );
};

export default Filter;
