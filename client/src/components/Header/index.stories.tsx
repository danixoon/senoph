import { storiesOf } from "@storybook/react";
import React from "react";
import Header from ".";

storiesOf("Components/Text/Header", module).add("simple", () => (
  <Header> I am the Header </Header>
));
