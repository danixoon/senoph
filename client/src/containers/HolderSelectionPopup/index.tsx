import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { InputBind, useInput } from "hooks/useInput";
import DepartmentSelectionPopupContainer from "containers/DepartmentSelectionPopup";
import { useHolderName } from "hooks/misc/useHolderName";
import ClickInput from "components/ClickInput";
import PopupLayer from "providers/PopupLayer";
import Dropdown from "components/Dropdown";
import { api } from "store/slices/api";

export type HolderSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
  targetBind: InputBind;
  name: string;
};

const HolderSelectionPopupContainer: React.FC<HolderSelectionPopupContainerProps> =
  (props) => {
    const { targetBind: bind, name, ...rest } = props;

    const [searchBind] = useInput({ departmentId: null, holderName: null });
    const { departmentId, holderName } = searchBind.input;

    const query = clearObject({ name: holderName, departmentId });

    const { holders } = useFetchHolder(query);
    const { data: items } = api.useFetchDepartmentsQuery({});

    const getHolderName = useHolderName();

    return (
      <ItemSelectionPopup
        {...rest}
        name={name}
        {...bind}
        items={
          holders?.items.map((item) => ({
            name: `${item.lastName} ${item.firstName} ${item.middleName}`,
            ...item,
          })) ?? []
        }
        header="Выбор владельца"
      >
        <Dropdown
          {...searchBind}
          name="departmentId"
          label="Подразделение"
          items={(items?.items ?? []).map((item) => ({
            label: item.name,
            id: item.id,
          }))}
        />
      </ItemSelectionPopup>
    );
  };

export default HolderSelectionPopupContainer;
