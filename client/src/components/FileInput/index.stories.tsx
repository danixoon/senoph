import { storiesOf } from "@storybook/react";
import React from "react";
import FileInput from ".";
import { useInput } from "hooks/useInput";
storiesOf("Components/Inputs/Input", module)
  .add("with label sm", () => {
    const [bind] = useInput({
      simple: "hello",
    });
    return (
      <FileInput
        label="Введите текст"
        size="sm"
        name="simple"
        placeholder="текст"
        {...bind}
      />
    );
  })
  .add("simple sm", () => {
    const [bind] = useInput({
      simple: "hello",
    });
    return <FileInput size="sm" name="simple" placeholder="текст" {...bind} />;
  })
  .add("info sm", () => {
    const [bind] = useInput({
      simple: "hello",
    });
    return (
      <>
        <FileInput
          size="sm"
          info="неверно"
          name="simple"
          placeholder="текст"
          {...bind}
        />
        <FileInput
          size="sm"
          info="неверно"
          name="simple"
          placeholder="текст"
          {...bind}
        />
        <FileInput
          size="sm"
          label="приветик"
          info="неверно"
          name="simple"
          placeholder="текст"
          {...bind}
        />
      </>
    );
  })
  .add("label md", () => {
    const [bind] = useInput({
      simple: "hello",
    });
    return (
      <FileInput
        size="md"
        label="Введите текст"
        name="simple"
        placeholder="текст"
        {...bind}
      />
    );
  })
  .add("info md", () => {
    const [bind] = useInput({
      simple: "hello",
    });
    return (
      <FileInput
        size="md"
        label="Введите текст"
        name="simple"
        info="неверно"
        placeholder="текст"
        {...bind}
      />
    );
  });
