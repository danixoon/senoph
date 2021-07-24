import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type InputProps<T = any> = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: T;
    name: keyof T;
    label?: string;
    info?: string;
    size?: Size;
    mapper?: (value: any) => any;

    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }
>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    info,
    size = "sm",
    input,
    name,
    mapper,
    inputProps = {},
    onChange,
    ...rest
  } = props;

  const mergedProps = mergeProps({ className: mergeClassNames(`input`) }, rest);
  const value = input[name] ?? "";

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (mapper) {
      e.target.value = value;
    }
    if (onChange) onChange(e);
  };

  return (
    <div {...mergedProps}>
      {label && (
        <Label className="input__label" weight="medium" size={size}>
          {label}
        </Label>
      )}
      <input
        ref={ref}
        className={mergeClassNames(`input__element input_${size}`)}
        value={mapper ? mapper(value) : value}
        name={name as string}
        onChange={handleOnChange}
        {...inputProps}
      />
      {info && <small className="input__info">{info}</small>}
    </div>
  );
});

export default Input;
