import * as React from "react";
import { mergeProps } from "utils";
import "./styles.styl";

export type FormError = Record<string, { message: string }>;

export type FormProps = OverrideProps<
  React.HTMLAttributes<HTMLFormElement>,
  {
    onSubmit?: (data: FormData) => void;
    preventDefault?: boolean;
    input?: any;
    inputError?: FormError;
  }
>;

export const InputErrorContext = React.createContext<FormError>({});

const Form: React.FC<React.PropsWithChildren<FormProps>> = (
  props: FormProps
) => {
  const {
    children,
    preventDefault = true,
    input = {},
    inputError,
    onSubmit,
    ...rest
  } = props;

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (preventDefault) e.preventDefault();

    if (!onSubmit) return;
    const data = new FormData(e.target as HTMLFormElement);
    for (const key in input) {
      data.set(key, input[key]);
    }

    onSubmit(data);
  };

  const mergedProps = mergeProps(
    {
      className: "form",
    },
    rest
  );

  return (
    <InputErrorContext.Provider value={inputError ?? {}}>
      <form {...mergedProps} onSubmit={handleOnSubmit}>
        {children}
      </form>
    </InputErrorContext.Provider>
  );
};

export default Form;
