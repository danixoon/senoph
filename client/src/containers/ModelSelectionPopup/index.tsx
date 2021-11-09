import React from "react";

import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useInput } from "hooks/useInput";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "targetBind">;

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> = (
  props
) => {
  const { targetBind, ...rest } = props;

  const { models } = useFilterConfig();
  const [searchBind] = useInput({ search: "" });

  const isIncludes = (str: string) =>
    searchBind.input.search
      ? str
          .trim()
          .toLowerCase()
          .includes(searchBind.input.search.trim().toLowerCase())
      : true;

  return (
    <ItemSelectionPopup
      {...rest}
      searchBind={searchBind}
      targetBind={targetBind}
      items={models.filter((item) => isIncludes(item.name))}
      header="Выбор модели"
    />
  );
};

export default ModelSelectionPopupContainer;
