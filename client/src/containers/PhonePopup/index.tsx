import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/PhonePopup";
import { useAppDispatch, useAppSelector } from "store";
import { changeMode, updateFilter } from "store/slices/phone";
import { useChanges } from "hooks/api/useChanges";
import { useMakeChanges } from "hooks/api/useMakeChanges";
import { useUndoChanges } from "hooks/api/useUndoChanges";
import ChangesContext from "providers/ChangesContext";

export type PhonePopupContainerProps = {};

const CHANGES_TARGET: ChangesTargetName = "Phone";

const PhonePopupContainer: React.FC<PhonePopupContainerProps> = (props) => {
  const { ...rest } = props;

  const { mode, filter } = useAppSelector((store) => store.phone);
  const { phone } = useFetchPhone(filter.selectedId);

  const dispatch = useAppDispatch();
  const [changes, makeChanges, undoChanges] = useChanges(CHANGES_TARGET);

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
        phone={phone}
        changes={changes}
        makeChanges={makeChanges}
        undoChanges={undoChanges}
        isEditMode={mode === "edit"}
        changeEditMode={() =>
          dispatch(changeMode(mode === "edit" ? "view" : "edit"))
        }
      />
    </ChangesContext.Provider>
  );
};

export default PhonePopupContainer;
