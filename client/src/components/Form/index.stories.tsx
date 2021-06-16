import { storiesOf } from "@storybook/react";
import AltPopup from "components/AltPopup";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Input from "components/Input";
import Toggle from "components/Toggle";
import { withAltLabel } from "hoc/withAltLabel";
import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import PopupLayerProvider from "providers/PopupLayerProvider";
import React from "react";
import Form from ".";

storiesOf("Components/Containers/Form", module).add("simple", () => {
  const bindInput = useInput({ username: "", password: "", invisible: false });
  const groupRef = React.useRef<HTMLDivElement | null>(null);

  const [showMessage, message, setMessage] = useTimeout<string | null>(null, 1000);

  return (
    <PopupLayerProvider>
      <Form
        input={bindInput.input}
        onSubmit={() => setMessage("Отправлено")}
        onReset={() => setMessage("Отменено.")}
        onChange={() => setMessage("Изменено.")}
      >
        <Input label="Имя" name="username" {...bindInput} />
        <Input label="Пароль" name="password" {...bindInput} />
        <Toggle label="Невидимка" name="invisible" {...bindInput} />
        <ButtonGroup ref={groupRef}>
          <Button type="reset"> Отменить </Button>
          <Button type="submit" color="primary">
            Отправить
          </Button>
        </ButtonGroup>
        <AltPopup position="bottom" target={showMessage ? groupRef.current : null}>
          {message}
        </AltPopup>
      </Form>
    </PopupLayerProvider>
  );
});
