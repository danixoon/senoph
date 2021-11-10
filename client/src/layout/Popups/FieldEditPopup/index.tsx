import Button from "components/Button";
import Form from "components/Form";
import Input from "components/Input";
import Popup, { PopupProps } from "components/Popup";
import { InputBind, useInput } from "hooks/useInput";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import * as React from "react";

import "./style.styl";

type FieldEditPopupType = "text";

export type FieldEditPopupProps = OverrideProps<
  PopupProps,
  {
    name: string;
    label?: string;
    type: FieldEditPopupType;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onReset: () => void;
  }
>;

const TextFieldPopup = React.forwardRef<
  HTMLInputElement,
  { bind: InputBind; label?: string }
>((props, ref) => {
  const { bind, ...rest } = props;
  return <Input {...bind} {...rest} ref={ref} name="value" />;
});

const FieldEditPopup: React.FC<FieldEditPopupProps> = (props) => {
  const { type, onSubmit, onReset, defaultValue = null, ...rest } = props;
  const [bind, clear] = useInput({ value: defaultValue });

  const handleSubmit = () => {
    onSubmit(bind.input.value ?? "");
    clear({ value: "" });
    if (rest.onToggle) rest.onToggle(false);
  };

  const handleReset = () => {
    onReset();
    if (rest.onToggle) rest.onToggle(false);
  };

  const isFirst = useIsFirstEffect();
  React.useEffect(() => {
    if (isFirst) return;
    clear({ value: defaultValue });
  }, [defaultValue]);

  const inputRef = React.useRef<HTMLInputElement | null>();

  React.useEffect(() => {
    if (rest.isOpen) inputRef.current?.focus();
    else clear({ value: defaultValue });
  }, [rest.isOpen]);

  // React.useEffect(() => {
  //   if()
  // }, [bind.input.value])

  const renderField = () => {
    switch (type) {
      case "text":
        return (
          <TextFieldPopup
            ref={(ref) => (inputRef.current = ref)}
            bind={bind}
            label={rest.label}
          />
        );
      default:
        return "";
    }
  };

  const isReset = bind.input.value === null;

  return (
    <Popup {...rest} size="sm">
      <Form input={bind.input}>
        {renderField()}
        <Button
          onClick={isReset ? handleReset : handleSubmit}
          disabled={bind.input.value === null && defaultValue === null}
          type="submit"
          color={isReset ? "primary" : "secondary"}
        >
          {isReset
            ? defaultValue === null
              ? "Изменения отсутствуют"
              : "Отменить"
            : "Применить"}
        </Button>
      </Form>
    </Popup>
  );
};

export default FieldEditPopup;
