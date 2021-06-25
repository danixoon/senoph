import * as React from "react";

export type InputBind<T = any> = {
  input: T;
  onChange: HookOnChange;
};

export type InputHook<T = any> = [InputBind<T>, (input: T) => void];

export type InputHookPrepare<T> = <K extends keyof T>(
  key: K,
  value: T[K],
  input: T
) => T;

export const useInput = function <T = any>(
  defaultValue: T = {} as T,
  prepareValue: InputHookPrepare<T> = (key, value, input) => input
): InputHook<T> {
  const [input, setInput] = React.useState<T>(() => defaultValue);

  const onChange = (e: {
    target: { name: string; type?: string; value: any };
  }) => {
    let changedInput = { ...input } as any;

    changedInput[e.target.name] =
      e.target.type === "checkbox"
        ? !changedInput[e.target.name]
        : e.target.value;

    if (
      typeof changedInput[e.target.name] === "string" &&
      changedInput[e.target.name].trim() === ""
    )
      changedInput[e.target.name] = null;

    changedInput = prepareValue(
      e.target.name as any,
      e.target.value as any,
      changedInput
    ) as any;

    setInput(changedInput);
  };

  return [{ input, onChange }, setInput];
};
