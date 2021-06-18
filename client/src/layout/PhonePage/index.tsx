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
import "./style.styl";

export type PhonePageProps = { page: "edit" | "filter" | string; items: any[] };

const PhonePage: React.FC<PhonePageProps> = (props) => {
  const { page, items } = props;
  const bind = useInput({
    search: "",
    phoneId: null,
    page: 5,
    ownerName: "",
  });

  React.useEffect(() => {
    bind.onChange({ target: { name: "phoneId", value: null } });
  }, [page]);

  const EmptyContent = () => (
    <Label style={{ margin: "auto" }} size="md">
      Select Category
    </Label>
  );

  const ResultsContent = ({ bind }: { bind: InputHook }) => {
    const [phoneInfoPopup, togglePhoneInfoPopup] = React.useState(() => false);

    React.useEffect(() => {
      if (bind.input.phoneId != null) togglePhoneInfoPopup(true);
    }, [bind.input.phoneId]);

    return (
      <>
        <Header align="right" className="margin_md">
          Результаты поиска
        </Header>
        <PopupLayer>
          <Popup
            size="lg"
            closeable
            isOpen={phoneInfoPopup}
            onToggle={togglePhoneInfoPopup}
          >
            hey
          </Popup>
        </PopupLayer>
        <Table
          {...bind}
          name="phoneId"
          items={[
            { id: 0, name: "Pupa" },
            { id: 1, name: "Loopa" },
            { id: 2, name: "Loopa Lupov" },
            { id: 3, name: "Loopa Zoopa" },
            { id: 4, name: "Loopa Owo" },
          ]}
          columns={[
            { key: "id", name: "Ид.", sortable: true },
            { key: "name", name: "Имя", sortable: true },
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

  return (
    <Layout flex="1" className="phone-page" flow="row">
      {page === "view" ? <ResultsContent bind={bind} /> : <EmptyContent />}
    </Layout>
  );
};

export const Filter: React.FC<{ filter: { name: string }, username: true }> = (props) => {
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

export default PhonePage;
