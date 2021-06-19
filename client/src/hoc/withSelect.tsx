import Layout from "components/Layout";
import React from "react";
import { useSelector } from "react-redux";

function withSelect<F extends { [P in K]: any }, K extends string>(
  FilterComponent: React.FC<F>,
  name: string,
  ...keys: K[]
) {
  return (props: Omit<F, K extends never ? unknown : K>) => {
    const state = useSelector<any, any>((store: any) => store[name]);
    const selected = {} as any;
    for (const k in keys) selected[k] = state[k];

    const fullProps = { ...props, ...selected } as F;
    return (
      <Layout className="filtered-list">
        <FilterComponent {...fullProps} />
      </Layout>
    );
  };
}

export default withSelect;
