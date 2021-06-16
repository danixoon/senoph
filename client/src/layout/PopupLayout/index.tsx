import * as React from "react";
import "./styles.styl";

export interface PopupLayerProps {}

const PopupLayout = React.forwardRef<HTMLDivElement>((props, layoutRef) => {
  return <div ref={layoutRef} className="popup-layout" />;
});

export default PopupLayout;
