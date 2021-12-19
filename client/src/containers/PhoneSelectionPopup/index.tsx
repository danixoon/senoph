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
import { extractStatus } from "store/utils";
import { NoticeContext } from "providers/NoticeProvider";
import { useNotice } from "hooks/useNotice";

export type PhoneSelectionPopupContainerProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const PAGE_ITEMS = 10;

const PhoneSelectionPopupContainer: React.FC<
  PhoneSelectionPopupContainerProps
> = (props) => {
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
              ? (item.model?.name ?? "")
                  .toLowerCase()
                  .includes(filterBind.input.search?.toLowerCase() ?? "")
              : true // &&
          // selectionIds.includes(item.id)
        )
        .map((item) => ({
          id: item.id,
          name: item.model?.name ?? "Без модели",
          inventoryKey: item.inventoryKey ?? "Без инвентарного",
        })) ?? [];

  const selectedItems = items.slice(offset, offset + PAGE_ITEMS);

  const [deletePhones, deletePhonesInfo] = api.useDeletePhoneMutation();
  const deletePhonesStatus = extractStatus(deletePhonesInfo);

  useNotice(deletePhonesStatus, {
    success:
      "Средства связи успешно помечены удалёнными и ожидают подтверждения.",
    onSuccess: () => {
      if (onToggle) onToggle();
      if (deletePhonesInfo.originalArgs?.ids)
        dispatch(updateSelection({ ids: [] }));
    },
  });

  // React.useEffect(() => {
  //   if (deletePhonesStatus.isSuccess) {
  //     if (onToggle) onToggle();
  //     noticeContext.createNotice(
  //       "Средства связи помечены удалёнными и ожидают подтверждения"
  //     );
  //   }
  //   if (deletePhonesStatus.isError) {
  //     noticeContext.createNotice(
  //       `Ошибка при удалении: (${deletePhonesStatus.error?.name})` +
  //         deletePhonesStatus.error?.description
  //     );
  //   }
  //   if (deletePhonesStatus.isLoading)
  //     noticeContext.createNotice("Средства связи удаляются..");
  // }, [deletePhonesStatus.status]);

  return (
    <PhoneSelectionPopup
      deletePhones={(ids) => deletePhones({ ids })}
      deletePhonesStatus={deletePhonesStatus}
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
