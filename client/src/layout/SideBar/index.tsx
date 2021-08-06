import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useInput } from "hooks/useInput";
import * as React from "react";
import "./style.styl";

export type SideBar = {
  page: "phone" | "category" | "holding" | "admin" | "commit";
  logout: () => void;
};

const SideBar: React.FC<SideBar> = (props) => {
  const { page, logout } = props;
  const handleSpoilerToggle = () => {};

  return (
    <Layout className="sidebar">
      <Spoiler
        opened={page === "phone"}
        onToggle={page === "phone" ? handleSpoilerToggle : undefined}
        label="Средства связи"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/phone/view">Просмотр</LinkItemContainer>
          <LinkItemContainer href="/phone/edit">Управление</LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "commit"}
        onToggle={page === "commit" ? handleSpoilerToggle : undefined}
        label="Изменения"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/commit">Внесение</LinkItemContainer>
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
          <LinkItemContainer href="/category/view">Просмотр</LinkItemContainer>
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
      <Hr />
      <Header align="center">Аккаунт</Header>

      <Button onClick={() => logout()}> Выйти </Button>
      <Hr />
    </Layout>
  );
};

export default SideBar;
