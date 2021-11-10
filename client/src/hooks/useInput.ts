import * as React from "react";

export type InputBind<T = any> = {
  input: PartialNullable<T>;
  onChange: HookOnChange;
};

export type InputFileBind<T = any> = {
  input: PartialNullable<T>;
  files: PartialNullable<{ [key: string]: FileList | null }>;
  onChange: HookOnChange;
};

export type InputHook<T = any> = [InputBind<T>, (input: T) => void];
export type InputFileHook<T = any> = [
  InputFileBind<T> & { ref: (el: HTMLInputElement) => void },
  (input: T) => void,
  React.RefObject<HTMLInputElement | null>
];

export type InputHookPrepare<P> = <
  T extends PartialNullable<P>,
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

export const useInput = function <P = any, T = PartialNullable<P>>(
  defaultValue: T = {} as T,
  prepareValue: InputHookPrepare<T> = (key, value, input) => input
): InputHook<T> {
  const [input, setInput] = React.useState<T>(() => defaultValue);

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
    textInput[prop] = (input[prop] as any)[0].name ?? "Не выбрано";
  }

  const ref = React.useRef<HTMLInputElement | null>(null);

  return [
    { input: textInput, files: input, onChange, ref: (r) => (ref.current = r) },
    setInput,
    ref,
  ];
};
