import AltPopup from "components/AltPopup";
import { FormContext } from "components/Form";
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
    required?: boolean;

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
    placeholder,
    type,
    mapper,
    inputProps = {},
    onChange,
    ...rest
  } = props;

  const mergedProps = mergeProps({ className: `input` }, rest);
  const value = input[name] ?? "";

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (mapper) {
      e.target.value = value;
    }
    if (onChange) onChange(e);
  };

  const formContext = React.useContext(FormContext);

  if (required)
    formContext.addCheck(input, name, (v) =>
      v == null ? "Значение обязательно" : false
    );

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

  return (
    <div {...mergedProps}>
      {label && (
        <Label className="input__label" weight="medium" size={size}>
          {label}
          {required ? (
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
        className={mergeClassNames(`input__element input_${size}`)}
        name={name as string}
        onChange={handleOnChange}
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
    </div>
  );
});

export default Input;
