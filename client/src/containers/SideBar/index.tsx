import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import SideBar from "layout/SideBar";
import React from "react";

type SideBarContainerProps = {};

const SideBarContainer: React.FC<SideBarContainerProps> = (props) => {
  return <SideBar />;
};

export default SideBarContainer;
