import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { IconProps } from "components/Icon";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem, { LinkItemProps } from "components/LinkItem";
import Span from "components/Span";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer, {
  LinkItemContainer as LinkItemContainerProps,
} from "containers/LinkItem";
import { useInput } from "hooks/useInput";
import * as React from "react";
import { useAppSelector } from "store";
import "./style.styl";

export type SideBar = {
  notice: Api.Models.Notice;
  page: "phone" | "category" | "holding" | "admin" | "commit";
  logout: () => void;
};

const NoticeBadge: React.FC<{ value: number }> = (props) => {
  const { value } = props;
  return <div className="notice-badge">{value}</div>;
};

const Item: React.FC<
  {
    badge?: number;
    icon: React.FC<IconProps>;
    text: string;
  } & LinkItemContainerProps
> = ({ badge, icon: IconItem, text, ...rest }) => (
  <LinkItemContainer {...rest}>
    <IconItem style={{ marginRight: "0.5rem" }} />
    <span className="sidebar__item-text">{text}</span>
    {badge ? <NoticeBadge value={badge} /> : ""}
  </LinkItemContainer>
);
const SideBar: React.FC<SideBar> = (props) => {
  const { notice, page, logout } = props;
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
              Средства связи <Icon.Phone inline />
              {notice.phone.changes || notice.phone.commits ? (
                <div className="notice-icon" />
              ) : (
                ""
              )}
            </>
          }
        >
          <Layout className="sidebar__group">
            {/* <LinkItemContainer
              href="/phone/view"
              withQuery={(loc) => loc.pathname.startsWith("/phone/edit")}
            >
              <Icon.Eye style={{ marginRight: "0.5rem" }} />
              Просмотр
            </LinkItemContainer> */}
            <Item
              icon={(p) => <Icon.Eye {...p} />}
              text="Просмотр"
              href="/phone/view"
              withQuery={(loc) => loc.pathname.startsWith("/phone/edit")}
            />
            <Item
              href="/phone/edit"
              withQuery={(loc) => loc.pathname.startsWith("/phone/view")}
              text="Управление"
              icon={(p) => <Icon.Settings {...p} />}
            />
            <Item
              href="/phone/commit/actions"
              text="Действия"
              badge={notice.phone.commits}
              icon={(p) => <Icon.DownloadCloud {...p} />}
            />
            <Item
              href="/phone/commit/updates"
              text="Изменения"
              badge={notice.phone.changes}
              icon={(p) => <Icon.Edit3 {...p} />}
            />
            <Item
              href="/phone/create"
              text="Создание"
              icon={(p) => <Icon.Plus {...p} />}
            />
          </Layout>
        </Spoiler>
        <Spoiler
          opened={page === "holding"}
          onToggle={page === "holding" ? handleSpoilerToggle : undefined}
          label={
            <>
              Движения
              <Icon.User inline />
              {notice.holding.changes || notice.holding.commits ? (
                <div className="notice-icon" />
              ) : (
                ""
              )}
            </>
          }
        >
          <Layout className="sidebar__group">
            <Item
              href="/holding/view"
              text="Просмотр"
              icon={(p) => <Icon.Eye {...p} />}
            />
            <Item
              href="/holding/commit"
              text="Подтверждения"
              icon={(p) => <Icon.Check {...p} />}
              badge={notice.holding.commits}
            />
            <Item
              href="/holding/phone/commit"
              text="Изменения"
              icon={(p) => <Icon.Edit3 {...p} />}
              badge={notice.holding.changes}
            />
            <Item
              href="/holding/update"
              text="Обновления"
              icon={(p) => <Icon.UserPlus {...p} />}
            />
            <Item
              href="/holding/create"
              text="Создание"
              icon={(p) => <Icon.Plus {...p} />}
            />
          </Layout>
        </Spoiler>
        <Spoiler
          opened={page === "category"}
          onToggle={page === "category" ? handleSpoilerToggle : undefined}
          label={
            <>
              Категорирование
              <Icon.Folder inline />
              {notice.category.changes || notice.category.commits ? (
                <div className="notice-icon" />
              ) : (
                ""
              )}
            </>
          }
        >
          <Layout className="sidebar__group">
            <Item
              href="/category/view"
              text="Просмотр"
              icon={(p) => <Icon.Eye {...p} />}
            />
            <Item
              href="/category/commit"
              text="Подтверждения"
              icon={(p) => <Icon.Check {...p} />}
              badge={notice.category.commits}
            />
            <Item
              href="/category/phone/commit"
              text="Изменения"
              icon={(p) => <Icon.Edit3 {...p} />}
              badge={notice.category.changes}
            />
            <Item
              href="/category/update"
              text="Обновление"
              icon={(p) => <Icon.FolderPlus {...p} />}
            />
            <Item
              href="/category/create"
              text="Создание"
              icon={(p) => <Icon.Plus {...p} />}
            />
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
            <Layout className="sidebar__group">
              <Item
                href="/admin/holders"
                text="Владельцы"
                icon={(p) => <Icon.Star {...p} />}
              />
              <Item
                href="/admin/placements"
                text="Местоположения"
                icon={(p) => <Icon.Globe {...p} />}
              />
              <Item
                href="/admin/departments"
                text="Подразделения"
                icon={(p) => <Icon.Home {...p} />}
              />
              <Item
                href="/admin/phone"
                text="Типы"
                icon={(p) => <Icon.Tag {...p} />}
              />
              <Item
                href="/admin/models"
                text="Модели"
                icon={(p) => <Icon.Phone {...p} />}
              />
              <Item
                href="/admin/users"
                text="Пользователи"
                icon={(p) => <Icon.User {...p} />}
              />
              <Item
                href="/admin/backups"
                text="Резервные копии"
                icon={(p) => <Icon.Database {...p} />}
              />
              <Item
                href="/admin/logs"
                text="История (логи)"
                icon={(p) => <Icon.Cloud {...p} />}
              />
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
