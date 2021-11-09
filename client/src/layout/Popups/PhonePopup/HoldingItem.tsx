import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem from "components/ListItem";
import React from "react";

const HoldingItem: React.FC<{
  holder: string;
  orderDate: Date;
}> = (props) => {
  return (
    <Layout className="holding-item">
      <ListItem label="Владелец">
        <Link>{props.holder}</Link>
      </ListItem>
      <ListItem label="Приказ">
        <Label weight="bold" style={{ margin: "0 0.5rem" }}>
          от
        </Label>
        <Link>{props.orderDate.toLocaleDateString()}</Link>
      </ListItem>
    </Layout>
  );
};

export default HoldingItem;
