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

    const [isDepartment, setIsDepartment] = React.useState(() => false);

    console.log(isDepartment);

    const getHolderName = useHolderName();
    const mapHolderName = (value: any) =>
      value === ""
        ? "Не выбрано"
        : getHolderName(holders.items.find((h) => h.id === value)) ??
          `Без имени (#${value})`;

    return (
      <ItemSelectionPopup
        {...rest}
        name={name}
        {...bind}
        items={
          holders?.items.map((item) => ({
            name: `${item.firstName} ${item.lastName} ${item.middleName}`,
            ...item,
          })) ?? []
        }
        header="Выбор владельца"
      >
        <ClickInput
          {...bind}
          name="departmentId"
          label="Подразделение"
          mapper={mapHolderName}
          onClick={() => setIsDepartment(true)}
        />

        <DepartmentSelectionPopupContainer
          onToggle={() => setIsDepartment(!isDepartment)}
          isOpen={isDepartment}
          name="departmentId"
          targetBind={searchBind}
          zIndex={155} //MAGIC NUMBER OH YEAH
        />
      </ItemSelectionPopup>
    );
  };

export default HolderSelectionPopupContainer;
