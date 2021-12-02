import Button from "components/Button";
import Icon from "components/Icon";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem from "components/ListItem";
import React from "react";

const HoldingItem: React.FC<{
  holder: string;
  holderId: number;
  department: string;
  departmentId: number;
  orderKey: string;
  orderDate: Date;
  orderUrl?: string;
  onSelect: () => void;
}> = (props) => {
  return (
    <Layout flow="row" className="holding-item">
      <Layout>
        <ListItem label="Владелец">
          <Link href={`/holding/view?holderId=${props.holderId}`}>
            {props.holder}
          </Link>
        </ListItem>
        <ListItem label="Подразделение">
          <Link href={`/holding/view?departmentId=${props.holderId}`}>
            {props.department}
          </Link>
        </ListItem>
        <ListItem label="Документ">
          <Link
            native
            href={props.orderUrl ? `/upload/${props.orderUrl}` : undefined}
          >
            {!props.orderUrl
              ? `${props.orderKey} (Без документа)`
              : props.orderKey}
          </Link>
          <Label weight="bold" style={{ margin: "0 0.5rem" }}>
            от
          </Label>
          <Link href={`/holding/view?orderDate=${props.orderDate}`}>
            {props.orderDate.toLocaleDateString()}
          </Link>
        </ListItem>
      </Layout>
      <Button onClick={props.onSelect} inverted color="primary">
        <Icon.ExternalLink />
      </Button>
    </Layout>
  );
};

export default HoldingItem;
