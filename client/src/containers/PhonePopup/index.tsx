import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";

import PhonePopup from "layout/Popups/PhonePopup";
import { useAppDispatch, useAppSelector } from "store";
import { changeMode, updateFilter, updateSelection } from "store/slices/phone";
import { useChanges } from "hooks/api/useChanges";
import { useMakeChanges } from "hooks/api/useMakeChanges";
import { useUndoChanges } from "hooks/api/useUndoChanges";
import { useNotice } from "hooks/useNotice";
import ChangesContext from "providers/ChangesContext";

import { api } from "store/slices/api";
import { push } from "connected-react-router";
import { useTogglePopup } from "hooks/useTogglePopup";
import { extractStatus, splitStatus } from "store/utils";

export type PhonePopupContainerProps = {};

const CHANGES_TARGET: ChangesTargetName = "phone";

const PhonePopupContainer: React.FC<PhonePopupContainerProps> = (props) => {
  const { ...rest } = props;

  const { mode, filter } = useAppSelector((store) => store.phone);
  const { data: phone, ...phoneFetchInfo } = api.useFetchPhoneQuery(
    {
      id: filter.selectedId,
    },
    { skip: filter.selectedId == null }
  );

  const dispatch = useAppDispatch();
  const [changes, makeChanges, undoChanges, status] =
    useChanges(CHANGES_TARGET);

  const [deletePhone, deletePhoneInfo] = api.useDeletePhoneMutation();
  const [deleteCategory] = api.useDeleteCategoryMutation();

  const selectedIds = useAppSelector((state) => state.phone.selectionIds);

  const phoneStatus = extractStatus(phoneFetchInfo, true);
  const deletePhoneStatus = extractStatus(deletePhoneInfo);
  useNotice(deletePhoneStatus, {
    success:
      "Средство связи успешно помечено удалённым и ожидает подтверждения.",
    onSuccess: () => {
      dispatch(updateFilter({ selectedId: null }));
      dispatch(
        updateSelection({
          ids: selectedIds.filter((id) => id.toString() !== filter.selectedId),
        })
      );
    },
  });

  if (phoneStatus.isError) dispatch(updateFilter({ selectedId: null }));

  const popup = useTogglePopup();

  return (
    <ChangesContext.Provider
      value={
        phone
          ? {
              changes,
              target: CHANGES_TARGET,
              targetId: phone.id,
              status: status.get(phone.id) ?? {
                targetId: phone.id,
                keys: [],
                status: splitStatus("idle"),
              },
            }
          : null
      }
    >
      <PhonePopup
        deletePhoneStatus={deletePhoneStatus}
        fetchPhoneStatus={phoneStatus}
        popupProps={{
          isOpen: filter.selectedId != null,
          onToggle: () => dispatch(updateFilter({ selectedId: null })),
        }}
        phone={phone ?? null}
        changes={changes}
        makeChanges={makeChanges}
        undoChanges={undoChanges}
        onSelectHolding={(id) => dispatch(push(`/holding/view?id=${id}`))}
        onDeleteCategory={(id) => deleteCategory({ id })}
        onDelete={() => (phone ? deletePhone({ ids: [phone.id] }) : null)}
        isEditMode={mode === "edit"}
        changeEditMode={() =>
          dispatch(changeMode(mode === "edit" ? "view" : "edit"))
        }
      />
    </ChangesContext.Provider>
  );
};

export default PhonePopupContainer;
