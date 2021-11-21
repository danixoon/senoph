import React from "react";

import PhoneCreatePopup from "layout/Popups/PhoneCreatePopup";
import { useAppDispatch } from "store";
import { useCreatePhones } from "hooks/api/useCreatePhones";
import { extractStatus, getError, getErrorMessage, splitStatus } from "store/utils";

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
      status={extractStatus(info)}
    />
  );
};

export default PhoneCreatePopupContainer;
