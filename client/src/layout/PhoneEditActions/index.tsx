import Icon from "components/Icon";
import Layout, { LayoutProps } from "components/Layout";
import Link from "components/Link";
import React from "react";

import "./style.styl";

export type PopupEditActionsProps = OverrideProps<LayoutProps, {}>;

const PopupEditActions: React.FC<PopupEditActionsProps> = (props) => {
  const { children, ...rest } = props;

  return (
    <Layout {...rest}>
      <Link size="sm" style={{ display: "flex", margin: "0.25rem" }}>
        <Icon.User size="md" /> Сменить владельца
      </Link>
      <Link style={{ display: "flex", margin: "0.25rem" }}>
        <Icon.Home size="md" /> Сменить подразделение
      </Link>
      <Link style={{ display: "flex", margin: "0.25rem" }}>
        <Icon.Key size="md" /> Сменить категорию
      </Link>
      {children}
    </Layout>
  );
};

export default PopupEditActions;
