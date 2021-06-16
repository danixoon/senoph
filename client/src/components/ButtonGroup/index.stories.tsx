import { storiesOf } from "@storybook/react";
import Button from "../Button";
import React from "react";
import ButtonGroup from ".";

storiesOf("Components/Buttons/Button Group", module)
  .add("group-sm", () => (
    <ButtonGroup>
      <Button>Push me</Button>
      <Button color="primary">Push me</Button>
      <Button color="primary">Push me</Button>
    </ButtonGroup>
  ))
  .add("group-md", () => (
    <ButtonGroup>
      <Button size="md">Push me</Button>
      <Button size="md" color="primary">
        Push me
      </Button>
      <Button size="md" color="primary">
        Push me
      </Button>
    </ButtonGroup>
  ));
