import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/Popups/PhonePopup";
import { useFetchPhonesQuery } from "store/slices/api";
import PhoneSelectionPopup from "layout/Popups/PhoneSelectionPopup";
import { InputBind, useInput } from "hooks/useInput";
import { clearObject } from "utils";
import { useAppDispatch, useAppSelector } from "store";
import { updateSelection } from "store/slices/phone";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useFetchHolder } from "hooks/api/useFetchHolder";

export type HolderSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "bind">;

const HolderSelectionPopupContainer: React.FC<HolderSelectionPopupContainerProps> = (
  props
) => {
  const { bind, ...rest } = props;

  const name = bind.input.search;
  const query = clearObject({ name });

  const { holders } = useFetchHolder(query);

  return (
    <ItemSelectionPopup
      {...rest}
      bind={bind}
      items={
        holders?.items.map((item) => ({
          name: `${item.firstName} ${item.lastName} ${item.middleName}`,
          ...item,
        })) ?? []
      }
      header="Выбор владельца"
    />
  );
};

export default HolderSelectionPopupContainer;
