import React from "react";

import Label from "components/Label";
import Layout from "components/Layout";
import { useInput } from "hooks/useInput";

import "./style.styl";

export type TopBarProps = React.PropsWithChildren<{ label?: string }>;

const TopBar = React.forwardRef<HTMLDivElement, TopBarProps>((props, ref) => {
  const { label, children } = props;

  const count = React.Children.count(children);

  // console.log("count is:", count);

  // if (count === 0) return <> </>;

  return (
    <Layout
      ref={ref}
      flow="row"
      className={`topbar ${count === 0 ? "topbar_hidden" : ""}`}
    >
      {children}
    </Layout>
  );
});

export default TopBar;
