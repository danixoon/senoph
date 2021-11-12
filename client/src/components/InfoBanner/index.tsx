// import { Link, Link as RouterLink } from "react-router-dom";
import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import Label from "components/Label";
import Span from "components/Span";
import Link from "components/Link";

export type InfoBannerProps = OverrideProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  {
    text: string;
    href: string;
    hrefContent: string;
  }
>;
const InfoBanner: React.FC<InfoBannerProps> = (props) => (
  <Label style={{ margin: "auto" }}>
    <Span>{props.text}</Span>
    <Link href={`${props.href}`} style={{ marginLeft: "0.2rem" }}>
      {props.hrefContent}
    </Link>
  </Label>
);

export default InfoBanner;
