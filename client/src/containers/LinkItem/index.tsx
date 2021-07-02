import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";

type LinkItemContainer = OverrideProps<Omit<LinkItemProps, "selected">, {}>;

const LinkItemContainer: React.FC<LinkItemContainer> = (props) => {
  const { href, ...rest } = props;
  const { pathname } = useLocation();

  return <LinkItem {...props} selected={pathname.startsWith(href ?? "")} />;
};

export default LinkItemContainer;
