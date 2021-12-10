import { storiesOf } from "@storybook/react";
import React from "react";
import Span from ".";

storiesOf("Components/Text/Span", module)
  .add("secondary", () => <Span> I am the Badge </Span>)
  .add("primary", () => (
    <Span color="primary" onClick={() => {}}>
      I am the Span
    </Span>
  ));
