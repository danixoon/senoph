import { storiesOf } from "@storybook/react";
import Input from "components/Input";
import React from "react";
import Spoiler from ".";
import { useInput } from "hooks/useInput";
import Toggle from "components/Toggle";
import Checkbox from "components/Checkbox";
storiesOf("Components/Containers/Spoiler", module).add("info md", () => {
  const [bind] = useInput({
    input: "пупа",
    name: true,
    checkbox: false,
  });
  return (
    <>
      <Spoiler label="Я типа спойлер">
        <Input label="Введи" name="input" {...bind} />
        <Toggle name="name" {...bind} label="Че такое" />
        <Checkbox label="Чекбокс" name="checkbox" {...bind} />
      </Spoiler>
      <Spoiler label="Я типа спойлер">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium
        repudiandae tenetur illum impedit eveniet quibusdam tempore atque amet
        enim voluptas officia alias dolores, aperiam error architecto reiciendis
        eum fuga laboriosam.
      </Spoiler>
    </>
  );
});
