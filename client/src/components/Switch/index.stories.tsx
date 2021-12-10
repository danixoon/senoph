import { storiesOf } from "@storybook/react";
import React from "react";
import Switch from ".";
import { useInput } from "hooks/useInput";
storiesOf("Components/Inputs/Switch", module).add("basic", () => {
  const [bind] = useInput({
    switch: "1",
  });
  return (
    <Switch
      name="switch"
      items={[
        { id: "1", name: "Один" },
        { id: "2", name: "Два" },
        { id: "3", name: "Три" },
      ]}
      {...bind}
    />
  );
});
