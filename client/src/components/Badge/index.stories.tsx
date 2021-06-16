import { storiesOf } from "@storybook/react";
import React from "react";
import Badge from ".";

storiesOf("Components/Text/Badge", module)
  .add("secondary", () => <Badge> I am the Badge </Badge>)
  .add("primary", () => (
    <Badge color="primary" isWarn onClick={() => {}}>
      I am the Badge
    </Badge>
  ));
