import React from "react";
import ReactDOM from "react-dom";

import { PopupProps } from "components/Popup";
import { PopupLayerContext } from "providers/PopupLayerProvider";

export const useTogglePopup = (isOpened: boolean = true) => {
  const [isOpen, setPopup] = React.useState(() => false);
  const [state, setState] = React.useState<any>(() => {});
  return {
    isOpen: isOpen && isOpened,
    onToggle: (state?: boolean) =>
      typeof state === "undefined" ? setPopup(!isOpen) : setPopup(state),
  };
};

export const useTogglePayloadPopup = (isOpened: boolean = true) => {
  const [isOpen, setPopup] = React.useState(() => false);
  const [state, setState] = React.useState<any>(() => {});
  return {
    isOpen: isOpen && isOpened,
    onToggle: (state?: boolean, payload?: any) => {
      setState(payload);
      return typeof state === "undefined" ? setPopup(!isOpen) : setPopup(state);
    },
    state,
  };
};
