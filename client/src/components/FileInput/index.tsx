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

export type FileInputProps<T = any> = InputProps<T>;

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (props, ref) => {
    const { ...rest } = props;

    const mergedInputProps = mergeProps(
      { className: "file-input" },
      rest.inputProps
    );

    return (
      <Input
        ref={ref}
        {...rest}
        inputProps={{ ...mergedInputProps, type: "file" }}
      />
    );
  }
);

export default FileInput;
