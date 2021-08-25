import HoldingPage from "layout/Pages/HoldingPage";
import React from "react";
import { useAppDispatch, useAppSelector } from "store";

type Props = {};
const HoldingPageContainer: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  
  return <HoldingPage />;
};

export default HoldingPageContainer;
