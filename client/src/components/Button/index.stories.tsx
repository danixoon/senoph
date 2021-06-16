import { storiesOf } from "@storybook/react";
import React from "react";
import Button from ".";

storiesOf("Components/Buttons/Button", module)
  .add("secondary-sm", () => <Button> Push me </Button>)
  .add("secondary-md", () => <Button size="md"> Push me </Button>)
  .add("primary-sm", () => <Button color="primary"> Push me </Button>)
  .add("primary-md", () => (
    <Button color="primary" size="md">
      Push me
    </Button>
  ))
  .add("disabled", () => (
    <>
      <Button disabled color="primary">Push me</Button>
      <Button disabled color="secondary">Push me</Button>
      <Button disabled size="md" color="primary">Push me</Button>
      <Button disabled size="md" color="secondary">Push me</Button>
    </>
  ));
