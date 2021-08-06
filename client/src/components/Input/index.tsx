import AltPopup from "components/AltPopup";
import { InputErrorContext } from "components/Form";
import Label from "components/Label";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { useTimeout } from "hooks/useTimeout";
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

  const errorContext = React.useContext(InputErrorContext);

  const infoText = info ?? errorContext[name as string]?.message;

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);

  const isFirst = useIsFirstEffect();

  React.useEffect(() => {
    // TODO: Make error context nullable
    if (isFirst) return;
    const msg = errorContext[name as string]?.message;
    toggleMessage(msg);
  }, [errorContext]);

  return (
    <div {...mergedProps}>
      {label && (
        <Label className="input__label" weight="medium" size={size}>
          {label}
        </Label>
      )}
      <input
        ref={(r) => (inputRef.current = r) && ref}
        className={mergeClassNames(`input__element input_${size}`)}
        value={mapper ? mapper(value) : value}
        name={name as string}
        onChange={handleOnChange}
        {...inputProps}
      />
      <AltPopup
        target={show && message ? inputRef.current : null}
        position="bottom"
      >
        {message}
      </AltPopup>
      {/* {infoText && <small className="input__info">{infoText}</small>} */}
    </div>
  );
});

export default Input;
