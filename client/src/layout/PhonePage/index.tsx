import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Paginator from "components/Paginator";
import Popup from "components/Popup";
import Spoiler from "components/Spoiler";
import Table from "components/Table";
import { InputHook, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { PhoneState } from "store/slices/phone";
import "./style.styl";

// export type PhonePageProps = {
//   page: "edit" | "filter" | string;
//   items: ApiResponse.Phone[];
// };

// const PhonePage: React.FC<PhonePageProps> = (props) => {
//   const EmptyContent = () => (
//     <Label style={{ margin: "auto" }} size="md">
//       Select Category
//     </Label>
//   );
// };

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

  // return (
  //   <Layout flex="1" className="phone-page">
  //     {page === "view" ? <ResultsContent bind={bind} /> : <EmptyContent />}
  //   </Layout>
  // );
};

export const Filter: React.FC<{ filter: PhoneState["filter"] }> = (props) => {
  const bind = useInput({});
  return (
    <>
      <Header align="right" className="margin_md">
        Фильтрация
      </Header>
      <Form className="filter-content__form">
        <Layout>
          <Input {...bind} name="search" label="Поиск" />
          <Dropdown
            {...bind}
            name="modelKey"
            label="Модель ТА"
            items={[
              { id: 0, label: "Gigaset A420" },
              { id: 1, label: "Gigaset A540" },
              { id: 2, label: "LG LKA 220" },
              { id: 3, label: "LG LKA 220C" },
            ]}
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
            items={[
              { id: 0, label: "Травматологическое отделение" },
              { id: 1, label: "Кардиологическое отделение" },
              { id: 2, label: "Офтальмологическое отделение" },
              { id: 3, label: "Отделение информационных технологий" },
            ]}
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
