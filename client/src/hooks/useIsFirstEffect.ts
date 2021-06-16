import * as React from "react";

export const useIsFirstEffect = () => {
  const isFirstRun = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
  });
  return isFirstRun.current;
};
