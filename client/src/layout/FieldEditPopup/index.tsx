import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Dropdown from "components/Dropdown";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import ListItem from "components/ListItem";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import Span from "components/Span";
import Spoiler from "components/Spoiler";
import Switch from "components/Switch";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { InputBind, useInput } from "hooks/useInput";
import * as React from "react";
import { Edit, Edit2, Edit3 } from "react-feather";
import qs from "query-string";

import "./style.styl";
import Paginator from "components/Paginator";

type FieldEditPopupType = "text";

export type FieldEditPopupProps = OverrideProps<
  PopupProps,
  {
    bind: InputBind;
    name: string;
    label?: string;
    type: FieldEditPopupType;
  }
>;

const TextFieldPopup: React.FC<
  OverrideProps<Omit<FieldEditPopupProps, "type">, {}>
> = (props) => {
  const { bind, ...rest } = props;
  return <Input {...bind} {...rest} />;
};

const FieldEditPopup: React.FC<FieldEditPopupProps> = (props) => {
  const { type, ...rest } = props;

  const renderField = () => {
    switch (type) {
      case "text":
        return <TextFieldPopup {...rest} />;
      default:
        return "";
    }
  };

  return (
    <Popup {...rest} size="sm">
      {renderField()}
      <Button>Применить</Button>
    </Popup>
  );
};

export default FieldEditPopup;
