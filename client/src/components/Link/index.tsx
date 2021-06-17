import { Link as RouterLink } from "react-router-dom";
import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export interface LinkProps
  extends React.PropsWithChildren<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  > {
  isMonospace?: boolean;
  size?: "xs" | "sm";
}

const Link: React.FC<LinkProps> = ({ href = "#", ...props }: LinkProps) => {
  const { children, isMonospace, size = "xs", onClick, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "link",
        `link_${size}`,
        isMonospace && "link_monospace"
      ),
    },
    rest
  );

  return (
    <RouterLink to={href} tabIndex={0} {...mergedProps} onClick={onClick}>
      {children}
    </RouterLink>
  );
};

export default withAltLabel(Link);
