import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type InputProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label?: string;
    info?: string;
    size?: "sm" | "md";
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }
>;

const Input: React.FC<InputProps> = (props) => {
  const { label, info, size = "sm", input, name, inputProps = {}, onChange, ...rest } = props;

  const mergedProps = mergeProps({ className: mergeClassNames(`input`) }, rest);

  return (
    <div {...mergedProps}>
      {label && (
        <Label className="input__label" weight="medium" size={size}>
          {label}
        </Label>
      )}
      <input
        className={mergeClassNames(`input__element input_${size}`)}
        value={input[name] ?? ""}
        name={name}
        onChange={onChange}
        {...inputProps}
      />
      {info && <small className="input__info">{info}</small>}
    </div>
  );
};

export default Input;
