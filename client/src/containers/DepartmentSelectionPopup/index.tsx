import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { InputBind, useInput } from "hooks/useInput";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { api } from "store/slices/api";
// import api from "api";

export type DepartmentSelectionPopupContainerProps = {
  onToggle: () => void;
  onSelect: (id: any, name: string) => void;
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
        onSelect={(item) => onSelect(item.id, item.name)}
        zIndex={zIndex}
        items={departments}
        header="Выбор подразделения"
      />
    );
  };

export default DepartmentSelectionPopupContainer;
