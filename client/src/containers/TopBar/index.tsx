import TopBar from "layout/TopBar";
import React from "react";
import { useLocation } from "react-router";

type TopBarContainerProps = {};

const TopBarContainer: React.FC<TopBarContainerProps> = (props) => {
  const { pathname } = useLocation();

  const names = {
    "/phone/view": "Поиск по моделям ТА",
    "/phone/edit": "Управление моделями ТА",
  } as any;

  const label = names[pathname] ?? "";

  return <TopBar label={label} />;
};

export default TopBarContainer;
