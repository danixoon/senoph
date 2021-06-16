import * as React from "react";

export type PreviousHook<T = any> = (props: T) => void;

export const usePrevious = <T>(props: T) => {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = props;
  });
  return ref.current;
};

/*


const [{ changed, message }, setInfo] = React.useState(
    () =>
      ({ changed: false, message: null } as {
        changed: boolean;
        message: string | null;
      })
  );

  const setMessage = (message: string) => {
    setInfo({ changed: true, message });
  };

  React.useEffect(() => {
    let timeout: number | null = null;

    setInfo({ message, changed: false });

    if (!changed) {
      timeout = window.setTimeout(
        () => setInfo({ message: null, changed: false }),
        1000
      );

      return () => (timeout ? clearTimeout(timeout) : undefined);
    }
  }, [changed]);

  */
