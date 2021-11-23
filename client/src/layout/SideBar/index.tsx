import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useInput } from "hooks/useInput";
import * as React from "react";
import { useAppSelector } from "store";
import "./style.styl";

export type SideBar = {
  page: "phone" | "category" | "holding" | "admin" | "commit";
  logout: () => void;
};

const SideBar: React.FC<SideBar> = (props) => {
  const { page, logout } = props;
  const handleSpoilerToggle = () => {};

  const user = useAppSelector((store) => store.app.user);

  return (
    <Layout className="sidebar">
      <Spoiler
        opened={page === "phone"}
        onToggle={page === "phone" ? handleSpoilerToggle : undefined}
        label="Средства связи"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer
            href="/phone/view"
            withQuery={(loc) => loc.pathname.startsWith("/phone/edit")}
          >
            Просмотр
            <Icon.Eye style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer
            href="/phone/edit"
            withQuery={(loc) => loc.pathname.startsWith("/phone/view")}
          >
            Управление
            <Icon.Settings style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "commit"}
        onToggle={page === "commit" ? handleSpoilerToggle : undefined}
        label="Действия"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/commit/phone/create">
            Внесения <Icon.Check style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer href="/commit/phone/delete">
            Удаления <Icon.X style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer href="/commit/phone/edit">
            Изменения <Icon.Edit3 style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "holding"}
        onToggle={page === "holding" ? handleSpoilerToggle : undefined}
        label="Движения"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/holding/view">
            Просмотр <Icon.Eye style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer href="/holding/commit">
            Подтверждения <Icon.Check style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer href="/holding/phone/commit">
            Изменения <Icon.Edit3 style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
          <LinkItemContainer href="/holding/create">
            Создание <Icon.Plus size="md" style={{ marginLeft: "auto" }} />
          </LinkItemContainer>
        </Layout>
      </Spoiler>
      <Spoiler
        opened={page === "category"}
        onToggle={page === "category" ? handleSpoilerToggle : undefined}
        label="Категорирование"
      >
        <Layout className="sidebar__group">
          <LinkItemContainer href="/category/view">Просмотр</LinkItemContainer>
          <LinkItemContainer href="/category/create">
            Создание
          </LinkItemContainer>
        </Layout>
      </Spoiler>
      {user.role === "admin" && (
        <Spoiler
          opened={page === "admin"}
          onToggle={page === "admin" ? handleSpoilerToggle : undefined}
          label="Администрирование"
        >
          <Layout className="sidebar__group">
            <LinkItemContainer href="/admin/users">
              Пользователи
            </LinkItemContainer>
            <LinkItemContainer href="/admin/departments">
              Подразделения
            </LinkItemContainer>
            <LinkItemContainer href="/admin/holders">
              Владельцы
            </LinkItemContainer>
            <LinkItemContainer href="/admin/phone">Типы</LinkItemContainer>
            <LinkItemContainer href="/admin/models">Модели</LinkItemContainer>
            <LinkItemContainer href="/admin/logs">
              История (логи)
            </LinkItemContainer>
          </Layout>
        </Spoiler>
      )}
      <Hr style={{ marginTop: "auto" }} />
      <Layout
        flow="row"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Header style={{ margin: "auto" }} align="center">
          Аккаунт ({user.name})
        </Header>
        <Button
          color="primary"
          size="lg"
          inverted
          onClick={() => logout()}
          style={{ marginLeft: "auto" }}
        >
          <Icon.LogOut />
        </Button>
      </Layout>
      <Hr />
    </Layout>
  );
};

export default SideBar;
