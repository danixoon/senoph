import Button from "components/Button";
import Icon from "components/Icon";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem from "components/ListItem";
import React from "react";

const HoldingItem: React.FC<{
  holder: string;
  orderDate: Date;
  onDelete: () => void;
  deletable?: boolean;
}> = (props) => {
  return (
    <Layout flow="row" className="holding-item">
      <Layout>
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
      {props.deletable && (
        <Button onClick={props.onDelete} inverted color="primary">
          <Icon.ExternalLink />
        </Button>
      )}
    </Layout>
  );
};

export default HoldingItem;
