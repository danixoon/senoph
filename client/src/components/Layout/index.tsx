import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type LayoutProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    margin?: "sm" | "md";
    padding?: "sm" | "md";
    flex?: React.CSSProperties["flex"];
    border?: boolean | string;
    flow?: React.CSSProperties["flexFlow"];
    // basis?: React.CSSProperties["flexBasis"];
  }
>;

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>((props, ref) => {
  const {
    children,
    padding,
    margin,
    border,
    flex,
    flow,
    // basis,
    ...rest
  } = props;

  const borderStyle =
    typeof border === "string" ? `${border.split("").map((b) => `b${b}`)}` : "";

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "layout",
        border && `border ${borderStyle}`,
        padding && `padding_${padding}`,
        margin && `mg_${margin}`
      ),
      style: { flexFlow: flow, flex },
    },
    rest
  );

  return (
    <div ref={ref} {...mergedProps}>
      {children}
    </div>
  );
});

export default Layout;
