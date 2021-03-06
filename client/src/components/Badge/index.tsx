import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type BadgeProps = OverrideProps<
  {
    color?: "secondary" | "primary" | "dark";
    isWarn?: boolean;
    noBorder?: boolean;
    margin?: Size;
  },
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
>;

const Badge: React.FC<BadgeProps> = (props) => {
  const {
    children,
    isWarn,
    noBorder,
    margin = "sm",
    color = "dark",
    onClick,
    ...rest
  } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        `mg_${margin}`,
        "badge",
        `badge_${color}`,
        noBorder && "badge_no-border",
        isWarn && "badge_warn",
        onClick && "badge_interactive"
      ),
    },
    rest
  );

  return (
    <div {...mergedProps} tabIndex={onClick ? 0 : undefined} onClick={onClick}>
      {children}
    </div>
  );
};

export default withAltLabel(Badge);
