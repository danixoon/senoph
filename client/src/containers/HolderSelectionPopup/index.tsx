import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { useInput } from "hooks/useInput";

export type HolderSelectionPopupContainerProps = {
  onToggle: () => void;
  departmentId?: any;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "targetBind">;

const HolderSelectionPopupContainer: React.FC<HolderSelectionPopupContainerProps> = (
  props
) => {
  const { targetBind, departmentId, ...rest } = props;

  const [searchBind] = useInput({ search: "" });

  const name = searchBind.input.search;
  const query = clearObject({ name, departmentId });

  const { holders } = useFetchHolder(query);

  return (
    <ItemSelectionPopup
      {...rest}
      searchBind={searchBind}
      targetBind={targetBind}
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
