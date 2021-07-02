import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import SideBar from "layout/SideBar";
import React from "react";
import { useLocation } from "react-router";

type SideBarContainerProps = {};

const SideBarContainer: React.FC<SideBarContainerProps> = (props) => {
  const { pathname } = useLocation();
  const page = pathname.split("/")[1];

  return <SideBar page={page as any} />;
};

export default SideBarContainer;
