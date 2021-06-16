import * as React from "react";
import { mergeProps } from "utils";
import "./styles.styl";

type FormProps = OverrideProps<
  React.HTMLAttributes<HTMLFormElement>,
  {
    onSubmit?: (data: FormData) => void;
    preventDefault?: boolean;
    input?: any;
  }
>;

const Form: React.FC<React.PropsWithChildren<FormProps>> = (
  props: FormProps
) => {
  const {
    children,
    preventDefault = true,
    input = {},
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
    <form {...mergedProps} onSubmit={handleOnSubmit}>
      {children}
    </form>
  );
};

export default Form;
