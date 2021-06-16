import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import * as React from "react";
import "./style.styl";

export type PhonePageProps = {};

const PhonePage: React.FC<PhonePageProps> = (props) => {
  const bind = useInput({ search: "" });
  return (
    <Layout className="phone-page">
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
    </Layout>
  );
};

export default PhonePage;
