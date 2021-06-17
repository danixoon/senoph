import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import Table from "components/Table";
import { useInput } from "hooks/useInput";
import * as React from "react";
import "./style.styl";

export type PhonePageProps = { page: "edit" | "filter" | string };

const PhonePage: React.FC<PhonePageProps> = (props) => {
  const { page } = props;
  const bind = useInput({ search: "", modelId: null });

  const EmptyContent = () => (
    // <Layout>
    <Label style={{ margin: "auto" }} size="md">
      Select Category
    </Label>
    // </Layout>
  );

  const FilterContent = () => (
    <>
      <Form>
        <Input {...bind} name="search" label="Search" />
        <Dropdown
          {...bind}
          name="modelKey"
          label="Phone Model"
          items={[
            { id: 0, label: "Gigaset A420" },
            { id: 1, label: "Gigaset A540" },
            { id: 2, label: "LG LKA 220" },
            { id: 3, label: "LG LKA 220C" },
          ]}
        />
      </Form>

      <Table
        {...bind}
        name="modelId"
        style={{ flex: 1, marginBottom: "auto" }}
        items={[
          { id: 0, name: "Pupa" },
          { id: 1, name: "Loopa" },
          { id: 2, name: "Loopa Lupov" },
          { id: 3, name: "Loopa Zoopa" },
          { id: 4, name: "Loopa Owo" },
        ]}
        columns={[
          { key: "id", name: "Id.", sortable: true },
          { key: "name", name: "Name", sortable: true },
        ]}
      />
    </>
  );

  return (
    <Layout padding="md" flex="1" className="phone-page" flow="row">
      {page === "filter" ? (
        <FilterContent />
      ) : page === "edit" ? (
        ""
      ) : (
        <EmptyContent />
      )}
    </Layout>
  );
};

export default PhonePage;
