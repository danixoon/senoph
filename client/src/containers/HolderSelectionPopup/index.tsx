import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { InputBind, useInput } from "hooks/useInput";
import DepartmentSelectionPopupContainer from "containers/DepartmentSelectionPopup";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import ClickInput from "components/ClickInput";
import PopupLayer from "providers/PopupLayer";
import Dropdown, { DropdownProps } from "components/Dropdown";
import { api } from "store/slices/api";
import Input from "components/Input";

export type HolderSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
  onSelect: (id: any, name: string) => void;
  dropdownProps?: Omit<DropdownProps, "name" | "input" | "onChange" | "items">;
};

const HolderSelectionPopupContainer: React.FC<
  HolderSelectionPopupContainerProps
> = (props) => {
  const { onSelect, dropdownProps = {}, ...rest } = props;

  const [searchBind] = useInput({ query: "" });
  const { query } = searchBind.input;

  const { holders } = useFetchHolder({});

  return (
    <ItemSelectionPopup
      items={(
        holders?.items.map((item) => ({
          name: splitHolderName(item),
          ...item,
        })) ?? []
      ).filter((item) => (!query ? true : item.name.includes(query)))}
      selectable
      onSelect={(item) => {
        onSelect(item.id, item.name);
      }}
      header="Выбор владельца"
      {...rest}
    >
      <Input style={{ flex: "1" }} placeholder="Запрос" name="query" {...searchBind} />
    </ItemSelectionPopup>
  );
};

export default HolderSelectionPopupContainer;
