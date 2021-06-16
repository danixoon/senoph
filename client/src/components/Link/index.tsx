import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

interface LinkProps
  extends React.PropsWithChildren<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  > {
  isMonospace?: boolean;
  size?: "xs" | "sm";
}

const Link: React.FC<LinkProps> = (props: LinkProps) => {
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
    <a tabIndex={0} {...mergedProps} onClick={onClick}>
      {children}
    </a>
  );
};

export default withAltLabel(Link);
