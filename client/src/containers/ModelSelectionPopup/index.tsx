import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/PhonePopup";
import { useFetchPhonesQuery } from "store/slices/api";
import PhoneSelectionPopup from "layout/PhoneSelectionPopup";
import { InputBind, useInput } from "hooks/useInput";
import { clearObject } from "utils";
import { useAppDispatch, useAppSelector } from "store";
import { updateSelection } from "store/slices/phone";
import ModelSelectionPopup, {
  ModelSelectionPopupProps,
} from "layout/ModelSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ModelSelectionPopupProps, "name" | "bind">;

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> = (
  props
) => {
  const { ...rest } = props;

  const { models } = useFilterConfig();

  return <ModelSelectionPopup {...rest} items={models} />;
};

export default ModelSelectionPopupContainer;
