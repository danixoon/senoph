import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import * as React from "react";
import "./style.styl";

export type SideBar = {};

const SideBar: React.FC<SideBar> = (props) => {
  return (
    <Layout className="sidebar">
      <Spoiler label="Модели ТА">
        <Layout className="sidebar__group">
          <Link href="/phone/filter">Просмотр</Link>
          <Link href="/phone/filter">Управление</Link>
        </Layout>
      </Spoiler>
      <Spoiler label="Движения">
        <Layout className="sidebar__group">
          <Link href="/phone/filter">Просмотр</Link>
          <Link href="/phone/filter">Управление</Link>
        </Layout>
      </Spoiler>
      <Spoiler label="Категорирование">
        <Layout className="sidebar__group">
          <Link href="/phone/filter">Просмотр</Link>
          <Link href="/phone/filter">Управление</Link>
        </Layout>
      </Spoiler>
    </Layout>
  );
};

export default SideBar;
