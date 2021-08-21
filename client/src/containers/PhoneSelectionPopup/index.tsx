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

const PhoneSelectionPopupContainer: React.FC<PhoneSelectionPopupContainerProps> = (
  props
) => {
  const {
    onToggle,
    isOpen,

    ...rest
  } = props;

  const { filter, selectionIds } = useAppSelector((state) => state.phone);
  const dispatch = useAppDispatch();

  const [offset, setOffset] = React.useState(() => 0);

  const [innerSelectionBind] = useInput({ search: null });

  const query = {
    ids: selectionIds,
    search: innerSelectionBind.input.search,
    offset,
    amount: PAGE_ITEMS,
  };

  const isNoSelection = selectionIds.length === 0;

  const { data } = api.useFetchPhonesQuery(clearObject(query), {
    skip: isNoSelection,
  });

  return (
    <PhoneSelectionPopup
      offset={offset}
      onOffsetChange={setOffset}
      onDeselect={(id) => {
        dispatch(
          updateSelection({
            ids: query.ids.filter((selectedId) => selectedId !== id),
          })
        );
      }}
      onDeselectAll={() => dispatch(updateSelection({ ids: [] }))}
      isOpen={isOpen}
      onToggle={onToggle}
      totalItems={isNoSelection ? 0 : data?.total ?? 0}
      pageItems={PAGE_ITEMS}
      bind={innerSelectionBind}
      items={
        isNoSelection
          ? []
          : data?.items
              .filter((item) => selectionIds.includes(item.id))
              .map((item) => ({
                id: item.id,
                name: item.model?.name ?? "Без модели",
              })) ?? []
      }
    />
  );
};

export default PhoneSelectionPopupContainer;
