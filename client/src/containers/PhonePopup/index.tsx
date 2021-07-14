import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/PhonePopup";
import { useAppDispatch, useAppSelector } from "store";
import { changeMode, updateFilter } from "store/slices/phone";

export type PhonePopupContainerProps = {};

const PhonePopupContainer: React.FC<PhonePopupContainerProps> = (props) => {
  const { ...rest } = props;
  const { mode, filter } = useAppSelector((store) => store.phone);
  const { phone } = useFetchPhone(filter.selectedId);
  const dispatch = useAppDispatch();

  return (
    <PhonePopup
      size="lg"
      isOpen={filter.selectedId != null}
      onToggle={() => dispatch(updateFilter({ selectedId: null }))}
      phone={phone}
      isEditMode={mode === "edit"}
      changeEditMode={() =>
        dispatch(changeMode(mode === "edit" ? "view" : "edit"))
      }
    />
  );
};

export default PhonePopupContainer;
