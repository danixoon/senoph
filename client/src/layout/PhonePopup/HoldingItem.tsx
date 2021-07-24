import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem from "components/ListItem";
import React from "react";

const HoldingItem: React.FC<{
  prevHolder: string;
  nextHolder: string;
  actKey: string;
  actDate: Date;
}> = (props) => {
  return (
    <Layout className="holding-item">
      <ListItem label="От">
        <Link>{props.prevHolder}</Link>
      </ListItem>
      <ListItem label="Кому">
        <Link>{props.nextHolder}</Link>
      </ListItem>
      <ListItem label="Акт">
        <Link size="sm">№{props.actKey}</Link>
        <Label weight="bold" style={{ margin: "0 0.5rem" }}>
          от
        </Label>
        <Link>{props.actDate.toLocaleDateString()}</Link>
      </ListItem>
    </Layout>
  );
};

export default HoldingItem;
