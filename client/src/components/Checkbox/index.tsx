import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type CheckboxProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label?: string;
    containerProps?: React.HTMLAttributes<HTMLElement>;
  }
>;

const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { label, input, disabled, containerProps, ...rest } = props;

  const checked =
    typeof input[rest.name] === "string"
      ? input[rest.name] === "false"
        ? false
        : true  
      : input[rest.name];

  const mergedProps = mergeProps(
    { className: mergeClassNames(`checkbox__input`) },
    rest
  );

  const mergedContainerProps = mergeProps(
    {
      className: mergeClassNames(
        "checkbox",
        checked && "checkbox_checked",
        disabled && "checkbox_disabled"
      ),
    },
    containerProps
  );

  return (
    <label {...mergedContainerProps}>
      <div className="checkbox__icon">
        <input
          type="checkbox"
          onChange={() => {}}
          {...mergedProps}
          disabled={disabled}
          checked={!!checked}
        />
      </div>
      {label && (
        <Label className="checkbox__label" margin="left" unselectable weight="medium">
          {label}
        </Label>
      )}
    </label>
  );
};

export default Checkbox;
