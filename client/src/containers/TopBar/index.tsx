import Label from "components/Label";
import TopBar from "layout/TopBar";
import React from "react";
import { useLocation } from "react-router";

type TopBarContainerProps = {};

const TopBarContainer = React.forwardRef<HTMLDivElement, TopBarContainerProps>(
  (props, ref) => {
    const { state } = useLocation<{ header?: string }>();

    const { header } = state ?? {};

    return <TopBar ref={ref}> {header && <Label size="lg">{header}</Label>} </TopBar>;
  }
);

export default TopBarContainer;
