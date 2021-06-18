import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import Link from "components/Link";
import Spoiler from "components/Spoiler";
import withFilter from "hoc/withFilteredList";
import { useInput } from "hooks/useInput";
import FilterPageLayout from "layout/FilterPageLayout";
import PhonePage, { Filter as PhonePageFilter } from "layout/PhonePage";
import SideBar from "layout/SideBar";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

const withItems = (Component: React.FC<{ items: any[] }>, name: string) => (
  props: any
) => {
  const { filter } = useSelector<any, any>((store: any) => store.phone);
  return <Component filter={filter} {...props} />;
};

// TODO: Make select filter & configure redux store
const Filter = withFilter(PhonePageFilter, "phone", "filter");

type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const { pathname } = useLocation();
  const page = pathname.split("/")[2];

  const { filter } = useSelector<any, any>((store: any) => store.phone);
  const dispatch = useDispatch();

  return (
    <>
      <Filter />
      {/* <FilterPageLayout> */}
      {/* <FilterPageLayout.Filter> */}
      {/* <Filter   /> */}
      {/* </FilterPageLayout.Filter> */}
      {/* <FilterPageLayout.Content> */}
      {/* <PhonePage page={page} /> */}
      {/* </FilterPageLayout.Content> */}
      {/* </FilterPageLayout> */}
    </>
  );
};

export default PhonePageContainer;
