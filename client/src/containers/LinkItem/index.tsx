import React from "react";
import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import type { Location } from "history";

type LinkItemContainer = OverrideProps<
  Omit<LinkItemProps, "selected">,
  {
    withQuery?: boolean | ((loc: Location<any>) => boolean);
  }
>;

const LinkItemContainer: React.FC<LinkItemContainer> = (props) => {
  const { href, withQuery, ...rest } = props;
  const location = useLocation();
  const { search, pathname } = location;

  const appendQuery =
    typeof withQuery === "function" ? withQuery(location) : withQuery;

  return (
    <LinkItem
      {...rest}
      href={`${href}${appendQuery && search ? search : ""}`}
      selected={pathname.startsWith(href ?? "")}
    />
  );
};

export default LinkItemContainer;
