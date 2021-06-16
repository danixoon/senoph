import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import "./styles.styl";
import Label from "components/Label";
import Button from "components/Button";

type ToggleProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label: string;
  }
>;

const Toggle: React.FC<ToggleProps> = (props) => {
  const { label, input, disabled, ...rest } = props;

  const mergedProps = mergeProps(
    { className: mergeClassNames(`toggle__input`) },
    rest
  );

  const checked = input[rest.name];

  return (
    <label className="toggle">
      <Label unselectable margin="right" className="toggle__label">
        {label}
      </Label>
      <input
        type="checkbox"
        {...mergedProps}
        disabled={disabled}
        checked={checked}
      />
      <div className="toggle__container">
        <svg
          width="32"
          height="16"
          viewBox="0 0 32 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={mergeClassNames(
            "toggle__icon",
            disabled && "toggle__icon_disabled",
            checked && "toggle__icon_checked"
          )}
        >
          <rect
            className="toggle__background"
            width="32"
            height="16"
            rx="8"
            fill="#FB6376"
          />
          <circle className="toggle__circle" cx="5" cy="5" r="5" fill="white" />
        </svg>
      </div>
    </label>
  );
};

export default Toggle;
