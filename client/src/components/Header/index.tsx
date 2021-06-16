import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type HeaderProps = OverrideProps<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>,
  {}
>;

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { children, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("header"),
    },
    rest
  );

  return <header {...mergedProps}>{children}</header>;
};

export default Header;
