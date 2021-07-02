import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/PhonePopup";
import { useFetchPhonesQuery } from "store/slices/api";
import PhoneSelectionPopup from "layout/PhoneSelectionPopup";
import { InputBind, useInput } from "hooks/useInput";
import { clearObject } from "utils";

export type PhoneSelectionPopupContainerProps = {
  queryBind: InputBind;

  selectedIds: any[];
  // isInversed: boolean;
  query: Omit<
    ApiRequest.FetchPhones,
    "ids" | "exceptIds" | "offset" | "amount"
  >;
  onSelectionChanged: (ids: any[]) => void;
  onToggle: () => void;

  isOpen: boolean;
};

const PhoneSelectionPopupContainer: React.FC<PhoneSelectionPopupContainerProps> = (
  props
) => {
  const {
    selectedIds,

    // isInversed,
    query,
    onSelectionChanged,
    onToggle,
    isOpen,
    queryBind,
    ...rest
  } = props;
  const idsQuery: Pick<ApiRequest.FetchPhones, "ids" | "exceptIds"> = {};
  // if (isInversed) idsQuery.exceptIds = selectedIds;
  /* else */ idsQuery.ids = selectedIds;

  const [offset, setOffset] = React.useState(() => 0);
  const PAGE_ITEMS = 10;

  const [filterSelectionBind] = useInput({ search: null });

  const q = {
    // ...query,
    ...idsQuery,
    search: filterSelectionBind.input.search,
    offset,
    amount: PAGE_ITEMS,
  };

  const isNoSelection = /* !isInversed && */ selectedIds.length === 0;

  const { data } = useFetchPhonesQuery(clearObject(q), {
    skip: isNoSelection,
  });

  return (
    <PhoneSelectionPopup
      offset={offset}
      onOffsetChange={setOffset}
      onDeselect={(id) => {
        onSelectionChanged(
          selectedIds.filter((selectedId) => selectedId !== id)
        );
      }}
      onDeselectAll={() => onSelectionChanged([])}
      isOpen={isOpen}
      onToggle={onToggle}
      totalItems={isNoSelection ? 0 : data?.total ?? 0}
      pageItems={PAGE_ITEMS}
      bind={filterSelectionBind}
      items={
        isNoSelection
          ? []
          : data?.items.map((item) => ({
              id: item.id,
              name: item.model?.name ?? "Без модели",
            })) ?? []
      }
    />
  );
};

export default PhoneSelectionPopupContainer;
