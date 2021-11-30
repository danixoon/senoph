import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { InputBind, useInput } from "hooks/useInput";
import { useFetchConfig } from "hooks/api/useFetchConfig";
import { api } from "store/slices/api";
// import api from "api";

export type DepartmentSelectionPopupContainerProps = {
  onToggle: () => void;
  onSelect: (id: any) => void;
  isOpen: boolean;
  zIndex?: number;
};

const DepartmentSelectionPopupContainer: React.FC<DepartmentSelectionPopupContainerProps> =
  (props) => {
    const { zIndex, onSelect, ...rest } = props;

    const { data } = api.useFetchDepartmentsQuery({});
    const departments = data?.items ?? [];

    return (
      <ItemSelectionPopup
        {...rest}
        onSelect={(item) => onSelect(item.id)}
        zIndex={zIndex}
        items={departments.map((item) => ({
          content: item.name,
          id: item.id,
          name: item.name,
        }))}
        header="Выбор подразделения"
      />
    );
  };

export default DepartmentSelectionPopupContainer;
