import Icon from "components/Icon";
import Layout, { LayoutProps } from "components/Layout";
import Link from "components/Link";
import React from "react";

import "./style.styl";

export type PopupEditActionsProps = OverrideProps<
  LayoutProps,
  {
    phoneIds: number[];
  }
>;

const PopupEditActions: React.FC<PopupEditActionsProps> = (props) => {
  const { children, phoneIds, ...rest } = props;

  return (
    <Layout {...rest}>
      <Link
        href={`/holding/create?phoneIds=${phoneIds.join()}`}
        size="sm"
        style={{ display: "flex", margin: "0.25rem" }}
      >
        <Icon.User size="md" /> Создать движение
      </Link>
      <Link
        href={`/category/create?phoneIds=${phoneIds.join()}`}
        style={{ display: "flex", margin: "0.25rem" }}
      >
        <Icon.Key size="md" /> Сменить категорию
      </Link>
      {children}
    </Layout>
  );
};

export default PopupEditActions;
