import * as React from "react";

export type InputBind<T = any> = {
  input: PartialNullable<T>;
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

export type InputHookPrepare<P> = <
  T extends PartialType<P, null | string>,
  K extends keyof T
>(
  key: K,
  value: T[K],
  input: T
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
  prepareValue: InputHookPrepare<PartialType<T, null | string>> = (
    key,
    value,
    input
  ) => input
): InputHook<PartialType<T, null | string>> {
  const [input, setInput] = React.useState<PartialType<T, null | string>>(
    () => defaultValue
  );

  const onChange: HookOnChange = (e) => {
    let changedInput = handleChangeEvent(input, e);

    changedInput = prepareValue(
      e.target.name as any,
      e.target.value as any,
      changedInput
    ) as any;

    setInput(changedInput);
  };

  return [{ input, onChange }, setInput];
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

  const ref = React.useRef<HTMLInputElement | null>(null);

  return [
    {
      input: textInput,
      files: input,
      onChange,
      ref: (e: HTMLInputElement) => (ref.current = e),
    },
    setInput,
    ref.current,
  ];
};
