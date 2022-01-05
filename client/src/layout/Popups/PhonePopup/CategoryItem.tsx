import Badge from "components/Badge";
import Button from "components/Button";
import Icon from "components/Icon";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import React from "react";

const CategoryItem: React.FC<{
  category: number;
  onSelect: () => void;
  deletable?: boolean;
  status: CommitStatus;
  actDate: Date;
  actUrl: string;
}> = (props) => {
  const { category, actDate, actUrl, status, deletable, onSelect } = props;

  let cat = "?";
  switch (category) {
    case 1:
      cat = "I (Прибыло, на гарантии)";
      break;
    case 2:
      cat = "II (Нет гарантии, исправно)";
      break;
    case 3:
      cat = "III (Неисправно)";
      break;
    case 4:
      cat = "IV (Подлежит списанию)";
      break;
  }

  const labelStyle = {
    style: { margin: "0 0.25rem", display: "inline" },
    weight: "bold",
  } as Pick<LabelProps, "style" | "weight">;

  const date = new Date(props.actDate).toISOString().split("T")[0];

  return (
    <Layout
      flow="column"
      // style={{ alignItems: "center" }}
      className="category-item"
    >
      <Layout flow="row">
        <Label {...labelStyle}>
          <Link native inline href={`/upload/${actUrl}`}>
            Акт
          </Link>{" "}
          от
        </Label>
        <Link href={`/category/view?actDate=${date}`}>
          {actDate.toLocaleDateString()}
        </Link>
        {status && (
          <Span
            style={{ marginLeft: "auto" }}
            weight="bold"
            font="monospace"
            color="primary"
          >
            {status === "create-pending"
              ? "ОЖИДАЕТ СОЗДАНИЯ"
              : "ОЖИДАЕТ УДАЛЕНИЯ"}
          </Span>
        )}
      </Layout>
      <Layout flow="row nowrap">
        <Badge onClick={() => {}} className="category-item__level">
          {cat}
        </Badge>
        <Button
          onClick={onSelect}
          style={{ marginLeft: "auto" }}
          inverted
          color="primary"
        >
          <Icon.ExternalLink />
        </Button>
      </Layout>
    </Layout>
  );
};

export default CategoryItem;
