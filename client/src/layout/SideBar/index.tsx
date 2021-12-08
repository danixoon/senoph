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
    <>
      <Layout className="sidebar">
        <Spoiler
          opened={page === "phone"}
          onToggle={page === "phone" ? handleSpoilerToggle : undefined}
          label={
            <>
              Средства связи{" "}
              <Icon.Phone style={{ marginLeft: "auto" }} inline />
            </>
          }
        >
          <Layout className="sidebar__group">
            <LinkItemContainer
              href="/phone/view"
              withQuery={(loc) => loc.pathname.startsWith("/phone/edit")}
            >
              <Icon.Eye style={{ marginRight: "0.5rem" }} />
              Просмотр
            </LinkItemContainer>
            <LinkItemContainer
              href="/phone/edit"
              withQuery={(loc) => loc.pathname.startsWith("/phone/view")}
            >
              <Icon.Settings style={{ marginRight: "0.5rem" }} />
              Управление
            </LinkItemContainer>
            <LinkItemContainer href="/phone/commit/actions">
              <Icon.DownloadCloud style={{ marginRight: "0.5rem" }} /> Действия
            </LinkItemContainer>
          </Layout>
        </Spoiler>
        <Spoiler
          opened={page === "holding"}
          onToggle={page === "holding" ? handleSpoilerToggle : undefined}
          label={
            <>
              Движения
              <Icon.User inline style={{ marginLeft: "auto" }} />
            </>
          }
        >
          <Layout className="sidebar__group">
            <LinkItemContainer href="/holding/view">
              <Icon.Eye style={{ marginRight: "0.5rem" }} /> Просмотр
            </LinkItemContainer>
            <LinkItemContainer href="/holding/commit">
              <Icon.Check style={{ marginRight: "0.5rem" }} /> Подтверждения
            </LinkItemContainer>
            <LinkItemContainer href="/holding/phone/commit">
              <Icon.Edit3 style={{ marginRight: "0.5rem" }} /> Изменения
            </LinkItemContainer>
            <LinkItemContainer href="/holding/update">
              <Icon.UserPlus size="md" style={{ marginRight: "0.5rem" }} />
              Обновление
            </LinkItemContainer>
            <LinkItemContainer href="/holding/create">
              <Icon.Plus size="md" style={{ marginRight: "0.5rem" }} /> Создание
            </LinkItemContainer>
          </Layout>
        </Spoiler>
        <Spoiler
          opened={page === "category"}
          onToggle={page === "category" ? handleSpoilerToggle : undefined}
          label={
            <>
              Категорирование
              <Icon.Key inline style={{ marginLeft: "auto" }} />
            </>
          }
        >
          <Layout className="sidebar__group">
            <LinkItemContainer href="/category/view">
              <Icon.Eye style={{ marginRight: "0.5rem" }} /> Просмотр
            </LinkItemContainer>
            <LinkItemContainer href="/category/commit">
              <Icon.Check style={{ marginRight: "0.5rem" }} /> Подтверждения
            </LinkItemContainer>
            <LinkItemContainer href="/category/phone/commit">
              <Icon.Edit3 style={{ marginRight: "0.5rem" }} /> Изменения
            </LinkItemContainer>
            <LinkItemContainer href="/category/update">
              <Icon.UserPlus size="md" style={{ marginRight: "0.5rem" }} />
              Обновление
            </LinkItemContainer>
            <LinkItemContainer href="/category/create">
              <Icon.Plus size="md" style={{ marginRight: "0.5rem" }} />
              Создание
            </LinkItemContainer>
          </Layout>
        </Spoiler>
        {user.role === "admin" && (
          <Spoiler
            opened={page === "admin"}
            onToggle={page === "admin" ? handleSpoilerToggle : undefined}
            label={
              <>
                Администрирование{" "}
                <Icon.Settings inline style={{ marginLeft: "auto" }} />
              </>
            }
          >
            <LinkItemContainer href="/admin/holders">
              <Icon.Star style={{ marginRight: "0.5rem" }} /> Владельцы
            </LinkItemContainer>
            <LinkItemContainer href="/admin/placements">
              <Icon.Globe style={{ marginRight: "0.5rem" }} /> Местоположения
            </LinkItemContainer>
            <LinkItemContainer href="/admin/departments">
              <Icon.Home style={{ marginRight: "0.5rem" }} /> Подразделения
            </LinkItemContainer>
            <Layout className="sidebar__group">
              <LinkItemContainer href="/admin/phone">
                <Icon.Folder style={{ marginRight: "0.5rem" }} /> Типы
              </LinkItemContainer>
              <LinkItemContainer href="/admin/models">
                <Icon.Phone style={{ marginRight: "0.5rem" }} /> Модели
              </LinkItemContainer>
              <LinkItemContainer href="/admin/users">
                <Icon.User style={{ marginRight: "0.5rem" }} /> Пользователи
              </LinkItemContainer>
              <LinkItemContainer href="/admin/backups">
                <Icon.Database style={{ marginRight: "0.5rem" }} /> Резервные
                копии
              </LinkItemContainer>
              <LinkItemContainer href="/admin/logs">
                <Icon.Cloud style={{ marginRight: "0.5rem" }} /> История (логи)
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
        <Header style={{ margin: "0" }} align="center">
          Версия {(window as any).__version__}
        </Header>
      </Layout>
    </>
  );
};

export default SideBar;
