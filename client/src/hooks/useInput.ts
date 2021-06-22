import * as React from "react";

export type InputHook<T = any> = {
  input: T;
  onChange: HookOnChange;
  // setInput: React.Dispatch<React.SetStateAction<T>>;
};

export const useInput = function <T extends object = any>(
  defaultValue: T = {} as T,
  prepareValue: <K extends keyof T>(key: K, value: T[K], input: T) => T = (
    key,
    value,
    input
  ) => input
): InputHook<T> {
  const [input, setInput] = React.useState<T>(() => defaultValue);

  const onChange = (e: {
    target: { name: string; type?: string; value: any };
  }) => {
    const changedInput = prepareValue(
      e.target.name as any,
      e.target.value as any,
      { ...input }
    ) as any;

    changedInput[e.target.name] =
      e.target.type === "checkbox"
        ? !changedInput[e.target.name]
        : e.target.value;
    setInput(changedInput);
  };

  return { input, onChange };
};
