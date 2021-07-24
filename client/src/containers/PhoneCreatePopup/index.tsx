import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhoneCreatePopup from "layout/PhoneCreatePopup";
import { useFetchPhonesQuery } from "store/slices/api";
import PhoneSelectionPopup from "layout/PhoneSelectionPopup";
import { InputBind, useInput } from "hooks/useInput";
import { clearObject } from "utils";
import { useAppDispatch, useAppSelector } from "store";
import { updateSelection } from "store/slices/phone";

export type PhoneCreatePopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const PhoneCreatePopupContainer: React.FC<PhoneCreatePopupContainerProps> = (
  props
) => {
  const { ...rest } = props;

  const dispatch = useAppDispatch();

  return <PhoneCreatePopup {...rest} />;
};

export default PhoneCreatePopupContainer;
