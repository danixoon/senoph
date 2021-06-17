import { storiesOf } from "@storybook/react";
import Button from "../Button";
import React from "react";
import Paginator from ".";

storiesOf("Components/Buttons/Button Group", module)
  .add("group-sm", () => (
    <> </>
    // <Paginator>
    //   <Button>Push me</Button>
    //   <Button color="primary">Push me</Button>
    //   <Button color="primary">Push me</Button>
    // </Paginator>
  ))
  .add("group-md", () => (
    <> </>
    // <Paginator>
    //   <Button size="md">Push me</Button>
    //   <Button size="md" color="primary">
    //     Push me
    //   </Button>
    //   <Button size="md" color="primary">
    //     Push me
    //   </Button>
    // </Paginator>
  ));
