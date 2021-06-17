import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useInput } from "hooks/useInput";
import * as React from "react";
import "./style.styl";

export type SideBar = { page: "phone" | "category" | "holding" | "admin" };

const SideBar: React.FC<SideBar> = (props) => {
  const { page } = props;
  const handleSpoilerToggle = () => {};



  return (
    <Layout className="sidebar">
      <Spoiler
        opened={page === "phone"}
        onToggle={page === "phone" ? handleSpoilerToggle : undefined}
        label="Модели ТА"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/phone/view">Просмотр</LinkItemContainer>
          <LinkItemContainer href="/phone/edit">Управление</LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "holding"}
        onToggle={page === "holding" ? handleSpoilerToggle : undefined}
        label="Движения"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/holding/view">Просмотр</LinkItemContainer>
          <LinkItemContainer href="/holding/edit">Управление</LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "category"}
        onToggle={page === "category" ? handleSpoilerToggle : undefined}
        label="Категорирование"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/category/view">
            Просмотр
          </LinkItemContainer>
          <LinkItemContainer href="/category/edit">
            Управление
          </LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "admin"}
        onToggle={page === "admin" ? handleSpoilerToggle : undefined}
        label="Администрирование"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/admin/panel">Управление</LinkItemContainer>
        </Layout>
      </Spoiler>
     
    </Layout>
  );
};

export default SideBar;
