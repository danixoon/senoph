import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
// import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/Popups/PhonePopup";
import { api } from "store/slices/api";
import PhoneSelectionPopup from "layout/Popups/PhoneSelectionPopup";
import { InputBind, useInput } from "hooks/useInput";
import { clearObject } from "utils";
import { useAppDispatch, useAppSelector } from "store";
import { updateSelection } from "store/slices/phone";

export type PhoneSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const PAGE_ITEMS = 10;

const PhoneSelectionPopupContainer: React.FC<PhoneSelectionPopupContainerProps> =
  (props) => {
    const {
      onToggle,
      isOpen,

      ...rest
    } = props;

    const { filter, selectionIds } = useAppSelector((state) => state.phone);
    const dispatch = useAppDispatch();

    const [offset, setOffset] = React.useState(() => 0);

    const [filterBind] = useInput({ search: null });

    const query = {
      ids: selectionIds,
      offset: 0,
      amount: selectionIds.length,
    };

    const isNoSelection = selectionIds.length === 0;

    const { data } = api.useFetchPhonesQuery(clearObject(query), {
      skip: isNoSelection,
    });

    const items = isNoSelection
      ? []
      : data?.items
          .filter(
            (item, i) =>
              filterBind.input.search !== null
                ? item.model?.name.includes(filterBind.input.search)
                : true // &&
            // selectionIds.includes(item.id)
          )
          .map((item) => ({
            id: item.id,
            name: item.model?.name ?? "Без модели",
          })) ?? [];

    const selectedItems = items.slice(offset, offset + PAGE_ITEMS);

    return (
      <PhoneSelectionPopup
        offset={offset}
        onOffsetChange={setOffset}
        onDeselect={(id) => {
          dispatch(
            updateSelection({
              ids: selectionIds.filter((selectedId) => selectedId !== id),
            })
          );
        }}
        onDeselectAll={() => dispatch(updateSelection({ ids: [] }))}
        isOpen={isOpen}
        onToggle={onToggle}
        totalItems={items.length}
        pageItems={PAGE_ITEMS}
        bind={filterBind}
        selectedIds={selectionIds}
        items={selectedItems}
      />
    );
  };

export default PhoneSelectionPopupContainer;
