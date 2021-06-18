import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Paginator from "components/Paginator";
import Popup from "components/Popup";
import Spoiler from "components/Spoiler";
import Table from "components/Table";
import { InputHook, useInput } from "hooks/useInput";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import "./style.styl";

export type FilterPageLayoutProps = {};

const FilterPageLayout: React.FC<FilterPageLayoutProps> & {
  Filter: typeof FilterContainer;
  Content: typeof ContentContainer;
} = ({ children }) => {
  return <>{children}</>;
};

const FilterContainer: React.FC<{}> = ({ children }) => {
  return <div>{children}</div>;
};
const ContentContainer: React.FC<{}> = ({ children }) => {
  return <div>{children}</div>;
};

FilterPageLayout.Filter = FilterContainer;
FilterPageLayout.Content = ContentContainer;

export default FilterPageLayout;
