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

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "bind">;

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> = (
  props
) => {
  const { bind, ...rest } = props;

  const { models } = useFilterConfig();

  const isIncludes = (str: string) =>
    bind.input.search
      ? str
          .trim()
          .toLowerCase()
          .includes(bind.input.search.trim().toLowerCase())
      : true;

  return (
    <ItemSelectionPopup
      {...rest}
      bind={bind}
      items={models.filter((item) => isIncludes(item.name))}
      header="Выбор модели"
    />
  );
};

export default ModelSelectionPopupContainer;
