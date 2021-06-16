import * as React from "react";
import { withAltLabel } from "hoc/withAltLabel";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type ButtonProps = OverrideProps<
  React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>,
  {
    color?: "secondary" | "primary" | "invisible";
    size?: "sm" | "md";
  }
>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { children, color = "secondary", size = "sm", ...rest } = props;

    const mergedProps = mergeProps(
      {
        className: mergeClassNames("btn", `btn_${color}`, `btn_${size}`),
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
