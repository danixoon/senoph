import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import SideBar from "layout/SideBar";
import React from "react";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "store";
import { logout } from "store/slices/app";

type SideBarContainerProps = {};

const SideBarContainer: React.FC<SideBarContainerProps> = (props) => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const page = pathname.split("/")[1];

  return <SideBar logout={() => dispatch(logout())} page={page as any} />;
};

export default SideBarContainer;
