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
import { useCreatePhones } from "hooks/api/useCreatePhones";
import { getError, getErrorMessage, isApiError } from "store/utils";

export type PhoneCreatePopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const PhoneCreatePopupContainer: React.FC<PhoneCreatePopupContainerProps> = (
  props
) => {
  const { ...rest } = props;

  const dispatch = useAppDispatch();
  const [createPhones, info] = useCreatePhones();

  return (
    <PhoneCreatePopup
      {...rest}
      createPhones={createPhones}
      error={getErrorMessage(info.error)}
      status={{
        error: getError(info.error),
        isIdle: info.isUninitialized,
        isError: info.isError,
        isLoading: info.isLoading,
        isSuccess: info.isSuccess,
      }}
    />
  );
};

export default PhoneCreatePopupContainer;
