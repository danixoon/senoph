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
        href={`/holding/update?phoneIds=${phoneIds.join()}`}
        size="sm"
        style={{ display: "flex", margin: "0.25rem" }}
      >
        <Icon.UserPlus size="md" /> Прикрепить к движению
      </Link>
      <Link
        href={`/category/create?phoneIds=${phoneIds.join()}`}
        style={{ display: "flex", margin: "0.25rem" }}
      >
        <Icon.Key size="md" /> Создать категорию
      </Link>
      <Link
        href={`/category/update?phoneIds=${phoneIds.join()}`}
        size="sm"
        style={{ display: "flex", margin: "0.25rem" }}
      >
        <Icon.UserPlus size="md" /> Прикрепить к акту категории
      </Link>
      {children}
    </Layout>
  );
};

export default PopupEditActions;
