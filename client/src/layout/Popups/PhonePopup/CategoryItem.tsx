import Badge from "components/Badge";
import Button from "components/Button";
import Icon from "components/Icon";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import React from "react";

const CategoryItem: React.FC<{
  category: number;
  onDelete: () => void;
  deletable?: boolean;
  actDate: Date;
  actUrl: string;
}> = (props) => {
  const { category, actDate, actUrl, deletable, onDelete } = props;

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

  return (
    <Layout flow="column" className="category-item">
      <Badge onClick={() => {}} className="category-item__level">
        {cat}
      </Badge>
      <Layout flow="row">
        <Label {...labelStyle}>
          <Link native inline href={`/upload/${actUrl}`}>
            Акт
          </Link>{" "}
          от
        </Label>
        <Link>{actDate.toLocaleDateString()}</Link>
        {deletable && (
          <Button
            onClick={onDelete}
            style={{ marginLeft: "auto" }}
            inverted
            color="primary"
          >
            <Icon.X />
          </Button>
        )}
      </Layout>
    </Layout>
  );
};

export default CategoryItem;
