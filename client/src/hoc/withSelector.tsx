import * as React from "react";

export const withSelector = function <P extends object, S extends object>(
  TargetComponent: React.FC<P>,
  selector: () => S
) {
  return (ownProps: Omit<P, keyof S>) => {
    const selectedProps = selector();
    const props = { ...ownProps, ...selectedProps } as S & P;
    return <TargetComponent {...props} />;
  };
};
