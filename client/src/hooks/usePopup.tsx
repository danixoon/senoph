import React from "react";
import ReactDOM from "react-dom";

import { PopupProps } from "components/Popup";
import { PopupLayerContext } from "providers/PopupLayerProvider";

export const usePopup = (Popup: React.ReactElement<PopupProps>) => {
  // const popupContext = React.useContext(PopupLayerContext);

  const [isOpen, togglePopup] = React.useState(() => false);

  const element = React.Children.only(Popup);

  const clone = React.cloneElement(element, { isOpen, onToggle: togglePopup });

  return [
    togglePopup,
    clone, // popupContext ? ReactDOM.createPortal(clone, popupContext) : "",
  ] as [typeof togglePopup, typeof clone];
};
