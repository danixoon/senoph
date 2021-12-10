import React from "react";

import PhoneCreatePopup from "layout/Popups/PhoneCreatePopup";
import { useAppDispatch } from "store";
import { useCreatePhones } from "hooks/api/useCreatePhones";
import {
  extractStatus,
  getError,
  getErrorMessage,
  splitStatus,
} from "store/utils";
import { api } from "store/slices/api";

export type PhoneCreatePopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const PhoneCreatePopupContainer: React.FC<PhoneCreatePopupContainerProps> = (
  props
) => {
  const { ...rest } = props;

  const dispatch = useAppDispatch();
  const [createPhones, phoneInfo] = useCreatePhones();
  const [createHolding, holdingInfo] = api.useCreateHoldingMutation();

  return (
    <PhoneCreatePopup
      {...rest}
      createdPhoneIds={phoneInfo.data?.created ?? []}
      createPhones={createPhones}
      createHoldings={(body) => createHolding(body as any)}
      phonesStatus={extractStatus(phoneInfo)}
      holdingsStatus={extractStatus(holdingInfo)}
    />
  );
};

export default PhoneCreatePopupContainer;
