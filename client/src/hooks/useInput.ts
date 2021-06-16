import * as React from "react";

export type InputHook<T = any> = {
  input: T;
} & WithHookOnChange;

export const useInput = function <T extends object = any>(
  defaultValue: T = {} as T
): InputHook<T> {
  const [input, setInput] = React.useState<T>(() => defaultValue);

  const onChange = (e: {
    target: { name: string; type?: string; value: any };
  }) => {
    const changedInput = { ...input } as any;
    changedInput[e.target.name] =
      e.target.type === "checkbox"
        ? !changedInput[e.target.name]
        : e.target.value;
    setInput(changedInput);
  };
  return { input, onChange };
};
