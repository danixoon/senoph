import { storiesOf } from "@storybook/react";
import Header from "components/Header";
import React from "react";
import Layout from ".";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import { useInput } from "hooks/useInput";

storiesOf("Components/Containers/Layout", module).add("layout", () => {
  const [bindInput] = useInput({ toggle: false });
  return (
    <Layout margin="md">
      <Header> Немые сообщения </Header>
      <Spoiler label="ячетакое">
        <Toggle name="toggle" label="аячетакое" {...bindInput} />
      </Spoiler>
    </Layout>
  );
});
