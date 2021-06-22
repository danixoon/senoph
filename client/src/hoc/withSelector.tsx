import Layout from "components/Layout";
import React from "react";
import { useSelector } from "react-redux";
import { useAppSelector } from "store";

function withSelect<P, S extends P>(
  FilterComponent: React.FC<P>,
  selector: (state: StoreType) => S
) {
  return (props: Omit<P, keyof S>) => {
    const selected = useAppSelector(selector);

    const fullProps = { ...props, ...selected } as P;
    return <FilterComponent {...fullProps} />;
  };
}

export default withSelect;
