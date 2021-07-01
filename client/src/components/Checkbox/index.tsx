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
  }
>;

const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { label, input, disabled, ...rest } = props;

  const mergedProps = mergeProps(
    { className: mergeClassNames(`checkbox__input`) },
    rest
  );

  const checked = input[rest.name];

  return (
    <label
      className={mergeClassNames(
        "checkbox",
        checked && "checkbox_checked",
        disabled && "checkbox_disabled"
      )}
    >
      <div className="checkbox__icon">
        <input
          type="checkbox"
          {...mergedProps}
          disabled={disabled}
          checked={checked}
        />
      </div>
      {label && (
        <Label className="checkbox__label" margin="left" unselectable>
          {label}
        </Label>
      )}
    </label>
  );
};

export default Checkbox;
