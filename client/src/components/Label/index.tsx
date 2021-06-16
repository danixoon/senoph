import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type LabelProps = OverrideProps<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>,
  {
    unselectable?: boolean;
    size?: "xs" | "sm" | "md";
    margin?: "right" | "left";
    weight?: "normal" | "medium" | "bold";
  }
>;

const Label: React.FC<LabelProps> = (props: LabelProps) => {
  const {
    children,
    unselectable,
    weight = "normal",
    size = "sm",
    margin,
    ...rest
  } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "label",
        `label_${size}`,
        unselectable && "label_unselectable",
        `weight_${weight}`
      ),
      style: margin && {
        [`margin${margin[0].toUpperCase() + margin.slice(1)}`]: "7px",
      },
    },
    rest
  );

  return <span {...mergedProps}>{children}</span>;
};

export default Label;
