import Badge from "components/Badge";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import React from "react";

const CategoryItem: React.FC<{
  category: number;
  actKey: string;
  actDate: Date;
}> = (props) => {
  const { category, actKey, actDate } = props;
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
      <Label {...labelStyle}>Акт </Label>
      <Link> №{actKey}</Link>
      <Label {...labelStyle}>от</Label>
      <Link>{actDate.toLocaleDateString()}</Link>
    </Layout>
  );
};

export default CategoryItem;
