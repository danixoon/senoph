import * as React from "react";
import { mergeProps } from "utils";
import "./styles.styl";

export type CheckPredicate = (v?: string | null) => boolean | string;
export type CheckAdder = (
  input: any,
  key: string,
  predicate: CheckPredicate
) => void;
export type FormError = Record<string, { message: string }>;
export type FormContext = {
  error: FormError;
  addCheck: CheckAdder;
};

export type FormProps = OverrideProps<
  React.HTMLAttributes<HTMLFormElement>,
  {
    onSubmit?: (data: FormData | any) => void;
    mapper?: (data: any) => any,
    preventDefault?: boolean;
    input: any;
    inputError?: FormError;
    json?: boolean;
  }
>;

export const FormContext = React.createContext<FormContext>({
  error: {},
  addCheck: () => {},
});

const Form: React.FC<React.PropsWithChildren<FormProps>> = (
  props: FormProps
) => {
  const {
    children,
    preventDefault = true,
    input = {},
    inputError,
    onSubmit,
    mapper,
    json = true,
    ...rest
  } = props;

  const mergedProps = mergeProps(
    {
      className: "form",
    },
    rest
  );

  // TODO: Возможен баг: при изменении количества инпутов будут оставаться привязанные к их полям валидаторы
  const validators = React.useRef<{
    [key: string]: CheckPredicate[];
  }>({});

  const [localErrors, setLocalErrors] = React.useState<FormError>(() => ({
    // departmentId: { message: "Жопа" },
  }));

  // React.useEffect(() => {
  //   setTimeout(() => (validators.current = {}));
  // });

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (preventDefault) e.preventDefault();

    if (!onSubmit) return;
    const data = new FormData();
    for (const key in validators.current) {
      const validationResult = validators.current[key].find((isInvalid) =>
        isInvalid(input[key])
      );

      if (validationResult) {
        setLocalErrors({
          ...localErrors,
          [key]: {
            message:
              typeof validationResult === "string"
                ? validationResult
                : "Неверное значение",
          },
        });
        return;
      }
    }

    const mappedInput = mapper ? mapper(input) : input;
    for (const key in mappedInput) {
      if (mappedInput[key] instanceof FileList) data.append(key, mappedInput[key][0]);
      else data.set(key, mappedInput[key]);
    }

    setLocalErrors({});
    validators.current = {};
    onSubmit(json && data ? Object.fromEntries(data.entries()) : data);
  };

  return (
    <FormContext.Provider
      value={{
        error: { ...(inputError ?? {}), ...localErrors },
        addCheck: (input, key, p) => {
          validators.current[key] = [...(validators.current[key] ?? []), p];
          // const v = p(input[key]);
          // if (v)
          //   setTimeout(() =>
          //     setLocalErrors({
          //       ...localErrors,
          //       [key]: {
          //         message: typeof v === "string" ? v : "Ошибочное поле",
          //       },
          //     })
          //   );
        },
      }}
    >
      <form {...mergedProps} onSubmit={handleOnSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

export default Form;
