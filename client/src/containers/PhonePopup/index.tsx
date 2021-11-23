import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";

import PhonePopup from "layout/Popups/PhonePopup";
import { useAppDispatch, useAppSelector } from "store";
import { changeMode, updateFilter } from "store/slices/phone";
import { useChanges } from "hooks/api/useChanges";
import { useMakeChanges } from "hooks/api/useMakeChanges";
import { useUndoChanges } from "hooks/api/useUndoChanges";
import ChangesContext from "providers/ChangesContext";

import { api } from "store/slices/api";
import { push } from "connected-react-router";
import { useTogglePopup } from "hooks/useTogglePopup";
import { extractStatus } from "store/utils";

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
  const [changes, makeChanges, undoChanges] = useChanges(CHANGES_TARGET);

  const [deletePhone] = api.useDeletePhoneMutation();
  const [deleteCategory] = api.useDeleteCategoryMutation();

  const phoneStatus = extractStatus(phoneFetchInfo, true);

  if (phoneStatus.isError) dispatch(updateFilter({ selectedId: null }));

  const popup = useTogglePopup();

  return (
    <ChangesContext.Provider
      value={
        phone ? { changes, target: CHANGES_TARGET, targetId: phone.id } : null
      }
    >
      <PhonePopup
        phoneStatus={phoneStatus}
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
        onDelete={() => (phone ? deletePhone({ id: phone.id }) : null)}
        isEditMode={mode === "edit"}
        changeEditMode={() =>
          dispatch(changeMode(mode === "edit" ? "view" : "edit"))
        }
      />
    </ChangesContext.Provider>
  );
};

export default PhonePopupContainer;
