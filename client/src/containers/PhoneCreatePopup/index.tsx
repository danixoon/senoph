import React from "react";

import PhoneCreatePopup from "layout/Popups/PhoneCreatePopup";
import { useAppDispatch } from "store";
import { useCreatePhones } from "hooks/api/useCreatePhones";
import { getError, getErrorMessage } from "store/utils";

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
