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

export type PhonePopupContainerProps = {};

const CHANGES_TARGET: ChangesTargetName = "phone";

const PhonePopupContainer: React.FC<PhonePopupContainerProps> = (props) => {
  const { ...rest } = props;

  const { mode, filter } = useAppSelector((store) => store.phone);
  const { data: phone, error } = api.useFetchPhoneQuery(
    {
      id: filter.selectedId,
    },
    { skip: filter.selectedId == null }
  );

  const dispatch = useAppDispatch();
  const [changes, makeChanges, undoChanges] = useChanges(CHANGES_TARGET);

  const [deletePhone] = api.usePhoneDeleteMutation();
  const [deleteCategory] = api.useDeleteCategoryMutation();

  if (error) dispatch(updateFilter({ selectedId: null }));

  return (
    <ChangesContext.Provider
      value={
        phone ? { changes, target: CHANGES_TARGET, targetId: phone.id } : null
      }
    >
      <PhonePopup
        size="lg"
        isOpen={filter.selectedId != null}
        onToggle={() => dispatch(updateFilter({ selectedId: null }))}
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
