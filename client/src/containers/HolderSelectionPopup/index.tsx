import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
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
