import { storiesOf } from "@storybook/react";
import React from "react";
import Dropdown from ".";
import { useInput } from "hooks/useInput";
storiesOf("Components/Inputs/Dropdown", module).add("info md", () => {
  const [bind] = useInput({
    item1: "2",
  });
  return (
    <>
      <Dropdown
        items={[
          { id: "1", payload: {}, label: "Мужской" },
          { id: "2", payload: {}, label: "Женский" },
          { id: "3", payload: {}, label: "Оно" },
        ]}
        label="Введите текст"
        name="simple"
        disabled
        style={{ width: "120px" }}
        {...bind}
      />
      <Dropdown
        items={[
          { id: "1", payload: {}, label: "Мужской" },
          { id: "2", payload: {}, label: "Женский" },
          { id: "3", payload: {}, label: "Оно" },
        ]}
        label="Введите текст"
        name="simple"
        style={{ width: "120px" }}
        {...bind}
      />
    </>
  );
});
