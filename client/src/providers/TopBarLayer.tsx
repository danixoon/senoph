import React from "react";
import ReactDOM from "react-dom";
import PopupLayout from "layout/PopupLayout";

export const TopBarContext = React.createContext<HTMLElement | null>(null);

export type TopBarLayerProps = {};

const TopBarLayer: React.FC<TopBarLayerProps> = ({ children }) => {
  return (
    <TopBarContext.Consumer>
      {(ref) => ref && ReactDOM.createPortal(children, ref)}
    </TopBarContext.Consumer>
  );
};

export default TopBarLayer;
