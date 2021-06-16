import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type ButtonGroupProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    position?: "top" | "bottom";
  }
>;

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (props, ref) => {
    const { children, position, ...rest } = props;

    const mergedProps = mergeProps(
      {
        className: mergeClassNames(
          "btn-group",
          position && `btn-group_${position}`
        ),
      },
      rest
    );

    return (
      <div ref={ref} {...mergedProps}>
        {children}
      </div>
    );
  }
);

export default ButtonGroup;
