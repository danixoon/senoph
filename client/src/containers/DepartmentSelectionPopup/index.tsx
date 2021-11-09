import React from "react";

import { clearObject } from "utils";
import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchHolder } from "hooks/api/useFetchHolder";
import { useInput } from "hooks/useInput";
import { useFilterConfig } from "hooks/api/useFetchConfig";

export type DepartmentSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "targetBind">;

const DepartmentSelectionPopupContainer: React.FC<DepartmentSelectionPopupContainerProps> = (
  props
) => {
  const { targetBind, ...rest } = props;

  const [searchBind] = useInput({ search: "" });

  const name = searchBind.input.search;

  const { departments } = useFilterConfig();

  return (
    <ItemSelectionPopup
      {...rest}
      searchBind={searchBind}
      targetBind={targetBind}
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
