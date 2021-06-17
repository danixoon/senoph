import { Link as RouterLink } from "react-router-dom";
import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type LinkItemProps = OverrideProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  {
    selected?: boolean;
  }
>;

const LinkItem: React.FC<LinkItemProps> = (props: LinkItemProps) => {
  const { children, selected, href = "#", ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("link-item", selected && "link-item_selected"),
    },
    rest
  );

  return (
    <RouterLink to={href} tabIndex={0} {...mergedProps}>
      {children}
    </RouterLink>
  );
};

export default withAltLabel(LinkItem);
