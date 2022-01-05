import React from "react";
import qs from "query-string";
import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Span from "components/Span";
import Input from "components/Input";
import ClickInput from "components/ClickInput";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import { useFileInput, useInput } from "hooks/useInput";
import Form from "components/Form";
import ModelSelectionPopupContainer from "containers/ModelSelectionPopup";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { importPhone } from "api/import";
import { NoticeContext } from "providers/NoticeProvider";
import { useTogglePopup } from "hooks/useTogglePopup";
import { clearObject, isResponse } from "utils";

import "./style.styl";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import Checkbox from "components/Checkbox";
import { useCreatePhones } from "hooks/api/useCreatePhones";
import TopBarLayer from "providers/TopBarLayer";
import { useAppDispatch } from "store";
import { extractStatus, parseItems } from "store/utils";
import { api } from "store/slices/api";
import { getDefaultColumns } from "./Items";
import Table, { TableColumn } from "components/Table";
import { replace } from "connected-react-router";
import { useLocation } from "react-router";
import { useNotice } from "hooks/useNotice";
import Toggle from "components/Toggle";
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import ButtonGroup from "components/ButtonGroup";

const useContainer = () => {
  const dispatch = useAppDispatch();
  return {};
};

const Update: React.FC<{}> = (props) => {
  const {} = useContainer();

  

  return <></>;
};

export default Update;
