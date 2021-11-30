import AltPopup from "components/AltPopup";
import { FormContext } from "components/Form";
import Input, { InputProps } from "components/Input";
import Label from "components/Label";
import Span from "components/Span";
import { useInput } from "hooks/useInput";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { useTimeout } from "hooks/useTimeout";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

const ClickInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "onChange"> & { onActive: () => void }
>((props, ref) => {
  const { onActive, ...rest } = props;

  return (
    <Input
      {...rest}
      onChange={void 0}
      inputProps={{
        ...(rest.inputProps ?? {}),
        onKeyDown: (e) => {
          console.log(e);
          if (e.code === "Space" || e.code === "Enter") onActive();
        },
        onClick: (e) => onActive(),
      }}
    />
  );
});

export default ClickInput;
