import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type ListItemProps = OverrideProps<
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>,
  {
    label?: string;
  }
>;

const ListItem: React.FC<ListItemProps> = (props: ListItemProps) => {
  const { children, label, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("list-item"),
    },
    rest
  );

  return (
    <div {...mergedProps}>
      <Label weight="bold" className="list-item__label">
        {label}
      </Label>
      <div className="list-item__content"> {children}</div>
    </div>
  );
};

export default ListItem;
