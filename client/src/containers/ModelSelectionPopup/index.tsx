import React from "react";

import ItemSelectionPopup, {
  ItemSelectionPopupProps,
} from "layout/Popups/ItemSelectionPopup";
import { useFetchConfig } from "hooks/api/useFetchConfig";
import { InputBind, useInput } from "hooks/useInput";
import Dropdown from "components/Dropdown";

export type ModelSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
  onSelect: (id: any, name: string) => void;
};

const ModelSelectionPopupContainer: React.FC<ModelSelectionPopupContainerProps> =
  (props) => {
    const { onSelect, ...rest } = props;

    const { models, types } = useFetchConfig();
    const [searchBind] = useInput({ phoneTypeId: null });

    const modelItems = searchBind.input.phoneTypeId
      ? models.filter(
          (model) => model.phoneTypeId === Number(searchBind.input.phoneTypeId)
        )
      : models;

    return (
      <ItemSelectionPopup
        onSelect={(item) => {
          onSelect(item.id, item.name);
        }}
        items={modelItems}
        header="Выбор модели"
        {...rest}
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
