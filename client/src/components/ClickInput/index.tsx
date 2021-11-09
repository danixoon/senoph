import AltPopup from "components/AltPopup";
import { FormContext } from "components/Form";
import Input, { InputProps } from "components/Input";
import Label from "components/Label";
import Span from "components/Span";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { useTimeout } from "hooks/useTimeout";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

const ClickInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { onClick, ...rest } = props;

    return (
      <Input
        {...rest}
        onChange={void 0}
        inputProps={{ ...(rest.inputProps ?? {}), onClick }}
      />
    );
  }
);

export default ClickInput;
