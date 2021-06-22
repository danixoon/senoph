import React from "react";

import Label from "components/Label";
import Layout from "components/Layout";
import { useInput } from "hooks/useInput";

import "./style.styl";

export type TopBarProps = { label?: string };

const TopBar: React.FC<TopBarProps> = (props) => {
  const { label, children } = props;

  return (
    <Layout flow="row" className="topbar">
      {children}
    </Layout>
  );
};

export default TopBar;
