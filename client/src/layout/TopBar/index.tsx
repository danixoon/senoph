import React from "react";

import Label from "components/Label";
import Layout from "components/Layout";
import { useInput } from "hooks/useInput";

import "./style.styl";

export type TopBarProps = { label?: string };

const TopBar = React.forwardRef<HTMLDivElement, TopBarProps>((props, ref) => {
  const { label, children } = props;

  return (
    <Layout ref={ref} flow="row" className="topbar">
      {children}
    </Layout>
  );
});

export default TopBar;
