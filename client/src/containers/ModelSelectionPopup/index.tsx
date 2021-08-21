import React from "react";

import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & Pick<ItemSelectionPopupProps, "name" | "bind">;

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> = (
  props
) => {
  const { bind, ...rest } = props;

  const { models } = useFilterConfig();

  const isIncludes = (str: string) =>
    bind.input.search
      ? str
          .trim()
          .toLowerCase()
          .includes(bind.input.search.trim().toLowerCase())
      : true;

  return (
    <ItemSelectionPopup
      {...rest}
      bind={bind}
      items={models.filter((item) => isIncludes(item.name))}
      header="Выбор модели"
    />
  );
};

export default ModelSelectionPopupContainer;
