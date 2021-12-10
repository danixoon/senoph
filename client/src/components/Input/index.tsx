import AltPopup from "components/AltPopup";
import Button from "components/Button";
import { CheckAdder, CheckPredicate, FormContext } from "components/Form";
import Icon from "components/Icon";
import Label from "components/Label";
import Span from "components/Span";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { useTimeout } from "hooks/useTimeout";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type InputProps<T = any> = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: T;
    name: string; //keyof T;
    label?: string;
    info?: string;
    size?: Size;
    mapper?: (value: any) => any;
    check?: CheckPredicate;
    required?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    blurrable?: boolean;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }
>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    info,
    size = "sm",
    disabled,
    input,
    name,
    required,
    check,
    placeholder,
    clearable,
    blurrable,
    type,
    mapper,
    inputProps = {},
    onChange,
    onClear,
    ...rest
  } = props;

  const mergedProps = mergeProps(
    { className: mergeClassNames(`input`, clearable && "input_clearable") },
    rest
  );
  const originalValue = input[name] ?? "";

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (mapper) {
      e.target.value = value;
    }
    if (onChange) onChange(e);
  };

  const formContext = React.useContext(FormContext);

  const isRequired = required && !disabled;

  if (isRequired)
    formContext.addCheck(input, name, (v) =>
      v == null ? "Значение обязательно" : false
    );

  if (check) {
    formContext.addCheck(input, name, check);
  }
  if (type === "date")
    formContext.addCheck(input, name, (v) => {
      try {
        if (!v) return false;

        const date = new Date(v);
        // date.
        return false;
      } catch (err) {
        return "Некорректная дата";
      }
    });

  // const infoText = info ?? formContext.error[name as string]?.message;

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);

  const isFirst = useIsFirstEffect();

  React.useEffect(() => {
    // TODO: Make error context nullable
    if (isFirst) return;
    const msg = formContext.error[name]?.message;
    toggleMessage(msg);
  }, [formContext.error[name]]);

  const [capturedEvent, setCapturedEvent] =
    React.useState<null | React.ChangeEvent<HTMLInputElement>>(null);

  const value = (blurrable ? capturedEvent?.target.value : originalValue) ?? "";

  return (
    <div {...mergedProps}>
      {label && (
        <Label className="input__label" weight="medium" size={size}>
          {label}
          {isRequired ? (
            <Span inline color="primary">
              *
            </Span>
          ) : (
            ""
          )}
        </Label>
      )}
      {type === "file" ? (
        <div
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.code === "Enter" || e.code === "Space")
              inputRef.current?.click();
          }}
          className={mergeClassNames(
            `input__element input_${size} input__element_file`
          )}
        >
          {value == "" ? "Файл не выбран" : mapper ? mapper(value) : value}
        </div>
      ) : (
        ""
      )}
      <input
        ref={(r) => {
          inputRef.current = r;
          // if (ref) return ref;
          // console.log(ref);
          if (typeof ref === "function") ref(r);
        }}
        className={mergeClassNames(
          `input__element input_${size}`,
          clearable && "input__element_clearable"
        )}
        name={name as string}
        onBlur={(e) => {
          if (blurrable && capturedEvent) {
            handleOnChange(capturedEvent);
          }
        }}
        onChange={(e) => {
          if (blurrable) setCapturedEvent(e);
          else handleOnChange(e);
        }}
        {...{
          ...inputProps,
          disabled,
          placeholder,
          type,
          ...(type === "file"
            ? { value: value === null ? "v" : undefined }
            : { value: mapper ? mapper(value) : value }),
        }}
      />
      <AltPopup
        target={show && message ? inputRef.current : null}
        position="bottom"
      >
        {message}
      </AltPopup>
      {/* {infoText && <small className="input__info">{infoText}</small>} */}
      {clearable && value && (
        <Button
          inverted
          color="primary"
          className="input__clear-button"
          onClick={() => {
            if (onChange) {
              onChange({ target: { name, value: "" } } as any);
            }
            if (onClear) onClear();
          }}
        >
          <Icon.X />
        </Button>
      )}
    </div>
  );
});

export default Input;
