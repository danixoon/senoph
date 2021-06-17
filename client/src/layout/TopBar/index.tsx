import Button from "components/Button";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useInput } from "hooks/useInput";
import * as React from "react";
import "./style.styl";

export type TopBarProps = { label?: string };

const TopBar: React.FC<TopBarProps> = (props) => {
  const { label } = props;
  const bind = useInput({});

  return (
    <Layout flow="row" className="topbar">
      <Button size="md" color="primary">Add Model</Button>
      <Label className="topbar__label" size="md">
        {label}
      </Label>
    </Layout>
  );
};

export default TopBar;
