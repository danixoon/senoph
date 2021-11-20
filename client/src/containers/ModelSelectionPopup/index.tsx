import React from "react";

import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { InputBind, useInput } from "hooks/useInput";
import Dropdown from "components/Dropdown";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
} & { name: string; targetBind: InputBind };

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> =
  (props) => {
    const { targetBind, ...rest } = props;

    const { models, types } = useFilterConfig();
    const [searchBind] = useInput({ phoneTypeId: null });

    const modelItems = searchBind.input.phoneTypeId
      ? models.filter(
          (model) => model.phoneTypeId === searchBind.input.phoneTypeId
        )
      : models;

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
        items={modelItems}
        header="Выбор модели"
      >
        <Dropdown
          {...searchBind}
          name="phoneTypeId"
          label="Тип"
          items={types.map((type) => ({
            label: type.name,
            id: type.id,
          }))}
        />
      </ItemSelectionPopup>
    );
  };

export default ModelSelectionPopupContainer;
