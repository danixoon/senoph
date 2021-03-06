import Button from "components/Button";
import Icon from "components/Icon";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem from "components/ListItem";
import Span from "components/Span";
import React from "react";

const HoldingItem: React.FC<{
  holder: string;
  holderId: number;
  department: string;
  departmentId: number;
  orderKey: string;
  status: CommitStatus;
  orderDate: Date;
  orderUrl?: string;
  onSelect: () => void;
}> = (props) => {
  const date = new Date(props.orderDate).toISOString().split("T")[0];

  return (
    <Layout flow="row" className="holding-item">
      <Layout>
        {props.status && (
          <Span
            color="primary"
            weight="bold"
            font="monospace"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            {props.status === "create-pending"
              ? "ОЖИДАЕТ СОЗДАНИЯ"
              : "ОЖИДАЕТ УДАЛЕНИЯ"}
          </Span>
        )}
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
          <Link href={`/holding/view?orderDate=${date}`}>
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
