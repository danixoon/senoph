import TopBar from "layout/TopBar";
import React from "react";
import { useLocation } from "react-router";

type TopBarContainerProps = {};

const TopBarContainer = React.forwardRef<HTMLDivElement, TopBarContainerProps>(
  (props, ref) => {
    // TODO: Create notification system via redux
    return <TopBar ref={ref} />;
  }
);

export default TopBarContainer;
