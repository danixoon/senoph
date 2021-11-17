import React from "react";

import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { InputBind, useInput } from "hooks/useInput";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & { name: string; targetBind: InputBind };

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> =
  (props) => {
    const { targetBind, ...rest } = props;

    const { models } = useFilterConfig();
    // const [searchBind] = useInput({ search: "" });

    // const isIncludes = (str: string) =>
    //   searchBind.input.search
    //     ? str
    //         .trim()
    //         .toLowerCase()
    //         .includes(searchBind.input.search.trim().toLowerCase())
    //     : true;

    return (
      <ItemSelectionPopup
        {...rest}
        {...targetBind}
        items={models}
        header="Выбор модели"
      />
    );
  };

export default ModelSelectionPopupContainer;
