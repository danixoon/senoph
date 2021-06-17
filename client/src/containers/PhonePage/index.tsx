import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import { useInput } from "hooks/useInput";
import PhonePage from "layout/PhonePage";
import SideBar from "layout/SideBar";
import React from "react";
import { useLocation } from "react-router";

type PhonePageContainerProps = {};

const PhonePagecContainer: React.FC<PhonePageContainerProps> = (props) => {
  const { pathname } = useLocation();
  const page = pathname.split("/")[2];
  return <PhonePage page={page} />;
};

export default PhonePagecContainer;
