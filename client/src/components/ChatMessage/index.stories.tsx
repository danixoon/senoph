import { storiesOf } from "@storybook/react";
import Header from "components/Header";
import React from "react";
import ChatMessage from ".";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import { useInput } from "hooks/useInput";
import Layout from "components/Layout";
import ButtonGroup from "components/ButtonGroup";
import Button from "components/Button";

storiesOf("Components/Chat/Chat Message", module).add("layout", () => {
  return (
    <Layout>
      <ChatMessage
        message="Lorem ipsum dolor sit amet"
        author="@dane4ka"
        time="18:23"
      >
        <ButtonGroup position="bottom">
          <Button> да </Button>
          <Button color="primary"> нет </Button>
        </ButtonGroup>
      </ChatMessage>
    </Layout>
  );
});
