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
  }
>;

const Input: React.FC<InputProps> = (props) => {
  const { label, info, size = "sm", input, ...rest } = props;

  const mergedProps = mergeProps(
    { className: mergeClassNames(`input__element input_${size}`) },
    rest
  );

  return (
    <div className="input">
      {label && (
        <Label
          className="input__label"
          weight="medium"
          size={size}
        >
          {label}
        </Label>
      )}
      <input {...mergedProps} value={input[rest.name] ?? ""} />
      {info && <small className="input__info">{info}</small>}
    </div>
  );
};

export default Input;
