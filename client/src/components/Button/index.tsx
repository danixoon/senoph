import * as React from "react";
import { withAltLabel } from "hoc/withAltLabel";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type ButtonProps = OverrideProps<
  React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>,
  {
    color?: "secondary" | "primary" | "bgDark";
    inverted?: boolean;
    fill?: boolean;
    size?: Size;
    margin?: Size;
  }
>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      color = "secondary",
      inverted,
      size = "sm",
      margin = "sm",
      fill,
      ...rest
    } = props;

    const mergedProps = mergeProps(
      {
        className: mergeClassNames(
          "btn",
          inverted && "btn_inverted",
          `btn_${color}`,
          `btn_${size}`,
          fill && "btn_fill",
          `mg_${margin}`
        ),
      },
      rest
    );

    return (
      <button ref={ref} {...mergedProps}>
        {children}
      </button>
    );
  }
);

export default Button;
