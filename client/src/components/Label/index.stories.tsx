import { storiesOf } from "@storybook/react";
import React from "react";
import Label from ".";

storiesOf("Components/Text/Label", module).add("simple", () => (
  <Label> I am the Label </Label>
));
