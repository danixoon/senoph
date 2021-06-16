import * as React from "react";
import * as ReactDOM from "react-dom";
import { PopupLayerContext } from "./PopupLayerProvider";

export interface PopupContainerProps {}

const PopupLayer: React.FC<React.PropsWithChildren<PopupContainerProps>> = ({
  children,
}) => {
  return (
    <PopupLayerContext.Consumer>
      {(ref) => {
        if (ref) return ReactDOM.createPortal(children, ref);
      }}
    </PopupLayerContext.Consumer>
  );
};

export default PopupLayer;
