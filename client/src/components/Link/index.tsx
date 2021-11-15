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
  native?: boolean;
}
const Link: React.FC<LinkProps> = ({ href, ...props }: LinkProps) => {
  const {
    children,
    isMonospace,
    native,
    size = "sm",
    onClick,
    ...rest
  } = props;

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

  return href && !native ? (
    <RouterLink to={href} tabIndex={0} {...mergedProps} onClick={onClick}>
      {children}
    </RouterLink>
  ) : (
    <a
      href={href ?? (native ? "#" : undefined)}
      tabIndex={0}
      {...mergedProps}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default withAltLabel(Link);
