import { storiesOf } from "@storybook/react";
import React from "react";
import Checkbox from ".";
import { useInput } from "hooks/useInput";
storiesOf("Components/Inputs/Checkbox", module)
  .add("on", () => {
    const bind = useInput({
      simple: true,
    });
    return (
      <Checkbox
        label="Введите текст"
        name="simple"
        placeholder="текст"
        {...bind}
      />
    );
  })
  .add("off", () => {
    const bind = useInput({
      simple: false,
    });
    return (
      <Checkbox
        label="Введите текст"
        name="simple"
        placeholder="текст"
        {...bind}
      />
    );
  })
  .add("disabled on", () => {
    const bind = useInput({
      simple: true,
    });
    return (
      <Checkbox
        label="Введите текст"
        name="simple"
        disabled={true}
        placeholder="текст"
        {...bind}
      />
    );
  })
  .add("disabled off", () => {
    const bind = useInput({
      simple: false,
    });
    return (
      <Checkbox
        label="Введите текст"
        name="simple"
        disabled={true}
        placeholder="текст"
        {...bind}
      />
    );
  });
