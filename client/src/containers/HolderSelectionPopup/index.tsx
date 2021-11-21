import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { InputBind, useInput } from "hooks/useInput";
import DepartmentSelectionPopupContainer from "containers/DepartmentSelectionPopup";
import { splitHolderName, useHolderName } from "hooks/misc/useHolderName";
import ClickInput from "components/ClickInput";
import PopupLayer from "providers/PopupLayer";
import Dropdown, { DropdownProps } from "components/Dropdown";
import { api } from "store/slices/api";

export type HolderSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
  onSelect: (id: any, name: string) => void;
  dropdownProps?: Omit<DropdownProps, "name" | "input" | "onChange" | "items">;
};

const HolderSelectionPopupContainer: React.FC<HolderSelectionPopupContainerProps> =
  (props) => {
    const { onSelect, dropdownProps = {}, ...rest } = props;

    const [searchBind] = useInput({ departmentId: null, holderName: null });
    const { departmentId } = searchBind.input;

    const { holders } = useFetchHolder(
      clearObject({
        departmentId: parseInt(departmentId as string),
      })
    );
    const { data: departments } = api.useFetchDepartmentsQuery({});

    return (
      <ItemSelectionPopup
        items={
          holders?.items.map((item) => ({
            name: splitHolderName(item),
            ...item,
          })) ?? []
        }
        onSelect={(item) => {
          onSelect(item.id, item.name);
        }}
        header="Выбор владельца"
        {...rest}
      >
        <Dropdown
          {...searchBind}
          name="departmentId"
          label="Подразделение"
          items={(departments?.items ?? []).map((item) => ({
            label: item.name,
            id: item.id,
          }))}
          {...dropdownProps}
        />
      </ItemSelectionPopup>
    );
  };

export default HolderSelectionPopupContainer;
