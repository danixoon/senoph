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
  isOpen: boolean;
  zIndex?: number;
} & { name: string; targetBind: InputBind };

const DepartmentSelectionPopupContainer: React.FC<DepartmentSelectionPopupContainerProps> =
  (props) => {
    const { targetBind, zIndex, ...rest } = props;

    // const [searchBind] = useInput({ search: "" });
    // const name = searchBind.input.search;

    const { data } = api.useFetchDepartmentsQuery({});
    const departments = data?.items ?? [];

    return (
      <ItemSelectionPopup
        {...rest}
        {...targetBind}
        // searchBind={searchBind}
        // targetBind={targetBind}
        zIndex={zIndex}
        items={
          name == null
            ? departments
            : departments.filter((dep) => dep.name.includes(name))
        }
        header="Выбор подразделения"
      />
    );
  };

export default DepartmentSelectionPopupContainer;
