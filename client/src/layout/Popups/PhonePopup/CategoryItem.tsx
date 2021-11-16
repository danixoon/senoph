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
}> = (props) => {
  const { category, actDate, deletable, onDelete } = props;
  let cat = "?";
  switch (category) {
    case 1:
      cat = "I";
      break;
    case 2:
      cat = "II";
      break;
    case 3:
      cat = "III";
      break;
    case 4:
      cat = "IV";
      break;
  }

  const labelStyle = { style: { margin: "0 0.25rem" }, weight: "bold" } as Pick<
    LabelProps,
    "style" | "weight"
  >;

  return (
    <Layout flow="row" className="category-item">
      <Badge onClick={() => {}} className="category-item__level">
        {cat}
      </Badge>
      <Label {...labelStyle}>Акт от</Label>
      <Link>{actDate.toLocaleDateString()}</Link>
      {deletable && (
        <Button onClick={onDelete} style={{ marginLeft: "auto" }} inverted color="primary">
          <Icon.X />
        </Button>
      )}
    </Layout>
  );
};

export default CategoryItem;
