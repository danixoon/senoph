import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import SideBar from "layout/SideBar";
import React from "react";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { logout } from "store/slices/app";

type SideBarContainerProps = {};

const SideBarContainer: React.FC<SideBarContainerProps> = (props) => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const page = pathname.split("/")[1];

  const fetchNotice = api.useFetchNoticeQuery({});

  return (
    <SideBar
      notice={
        fetchNotice.data ?? {
          phone: { commits: 0, changes: 0 },
          holding: { commits: 0, changes: 0 },
          category: { commits: 0, changes: 0 },
        }
      }
      logout={() => dispatch(logout())}
      page={page as any}
    />
  );
};

export default SideBarContainer;
