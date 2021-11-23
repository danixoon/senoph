import TopBar from "layout/TopBar";
import React from "react";
import { useLocation } from "react-router";

type TopBarContainerProps = {};

const TopBarContainer = React.forwardRef<HTMLDivElement, TopBarContainerProps>(
  (props, ref) => {
    return <TopBar ref={ref} />;
  }
);

export default TopBarContainer;
