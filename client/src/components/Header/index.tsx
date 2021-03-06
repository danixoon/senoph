import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type HeaderProps = OverrideProps<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>,
  {
    hr?: boolean;
    align?: React.CSSProperties["textAlign"];
    bottom?: boolean;
    unsized?: boolean;
  }
>;

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { children, hr, align, unsized, bottom, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("header", hr && "header_hr", bottom && "header_bottom", unsized && "header_unsized"),
      style: { textAlign: align },
    },
    rest
  );

  return <header {...mergedProps}>{children}</header>;
};

export default Header;
