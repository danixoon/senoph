import * as React from "react";
import { useIsFirstEffect } from "./useIsFirstEffect";

export type TimeoutHook<T = any> = [boolean, T, (value: T) => void];

export const useTimeout = <T>(startValue: T, timeout: number) => {
  const [{ changed, value, expired }, setInfo] = React.useState(
    () =>
      ({ changed: false, value: startValue, expired: true } as {
        value: T;
        changed: boolean;
        expired: boolean;
      })
  );

  const setValue = (newValue: T) => {
    setInfo({ changed: true, value: newValue, expired: false });
  };

  const isFirst = useIsFirstEffect();

  React.useEffect(() => {
    if (isFirst) return;
    let timeoutId: number | null = null;

    setInfo({ value: value, changed: false, expired: false });

    if (!changed) {
      timeoutId = window.setTimeout(
        () => setInfo({ value, changed: false, expired: true }),
        timeout
      );

      return () => (timeoutId ? clearTimeout(timeoutId) : undefined);
    }
  }, [changed]);

  return [!expired, value, setValue] as TimeoutHook<T>;
};
