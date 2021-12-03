import * as React from "react";

export type InputBind<T = any> = {
  input: PartialType<T, null | string>;
  onChange: HookOnChange;
};

export type SetInput<T = any> = (input: T) => void;

export type InputFileBind<T = any> = {
  input: PartialNullable<T>;
  files: PartialNullable<{ [key: string]: FileList | null }>;
  onChange: HookOnChange;
};

export type InputHook<T = any> = [InputBind<T>, SetInput<T>];
export type InputFileHook<T = any> = [
  InputFileBind<T> & { ref: (e: HTMLInputElement) => void },
  (input: T) => void,
  HTMLInputElement | null
];

export type InputHookPrepare<P> = <T extends PartialType<P, null | string>>(
  nextInput: T
) => T;

export const handleChangeEvent = <T>(
  input: T,
  e: {
    target: {
      name: string;
      type?: string;
      value: any;
      files?: FileList | null;
    };
  }
) => {
  let changedInput = { ...input } as any;

  switch (e.target.type) {
    case "checkbox":
      changedInput[e.target.name] = !changedInput[e.target.name];
      break;
    case "file":
      changedInput[e.target.name] = e.target.files;
      break;
    default:
      changedInput[e.target.name] = e.target.value;
      break;
  }

  if (
    e.target.type !== "file" &&
    typeof changedInput[e.target.name] === "string" &&
    changedInput[e.target.name].trim() === ""
  )
    changedInput[e.target.name] = null;

  return changedInput;
};

export const useInput = function <T>(
  defaultValue: PartialType<T, null | string> = {} as PartialType<
    T,
    null | string
  >,
  prepareValue: InputHookPrepare<PartialType<T, null | string>> = (nextInput) =>
    nextInput
): InputHook<PartialType<T, null | string>> {
  const [input, setInput] = React.useState<PartialType<T, null | string>>(
    () => defaultValue
  );

  const onChange: HookOnChange = (e) => {
    let changedInput = handleChangeEvent(input, e);

    changedInput = prepareValue(changedInput) as any;

    setInput(changedInput);
  };

  return [
    { input, onChange },
    (values) => {
      // let result = { ...values };
      // for (const key in values)
      const result = prepareValue(values);

      setInput(result);
    },
  ];
};

export const useFileInput = function <
  P = any,
  T extends PartialNullable<{
    [K in keyof P]: FileList | null;
  }> = PartialNullable<{ [K in keyof P]: FileList | null }>
>(): InputFileHook<T> {
  const [input, setInput] = React.useState<T>(() => ({} as any));

  const onChange: HookOnChange = (e) => {
    let changedInput = handleChangeEvent(input, e);

    setInput(changedInput);
  };

  const textInput = {} as any;

  for (const prop in input) {
    const propValue = (input[prop] as any) ?? [{}];
    textInput[prop] = propValue[0]?.name ?? "Не выбрано";
  }

  const [ref, setRef] = React.useState<HTMLInputElement | null>(null);

  return [
    {
      input: textInput,
      files: input,
      onChange,
      ref: (e: HTMLInputElement) => setRef(e),
    },
    setInput,
    ref,
  ];
};
