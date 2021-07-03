import React from "react";

import LinkItem, { LinkItemProps } from "components/LinkItem";
import { useLocation } from "react-router";
import { useFetchPhone } from "hooks/api/useFetchPhone";
import PhonePopup from "layout/PhonePopup";

export type PhonePopupContainerProps = {
  selectedId: number | null;
  onToggle: () => void;
};

const PhonePopupContainer: React.FC<PhonePopupContainerProps> = (props) => {
  const { selectedId, onToggle, ...rest } = props;
  const { phone } = useFetchPhone(selectedId);
  const { pathname } = useLocation();
  return (
    <PhonePopup
      size="lg"
      isOpen={selectedId != null}
      onToggle={onToggle}
      phone={phone}
      isEditMode={pathname.startsWith("/phone/edit")}
      changeEditMode={() => {}}
    />
  );
};

export default PhonePopupContainer;
