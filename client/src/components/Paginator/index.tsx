import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type PaginatorProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    min: number;
    max: number;
    size: number;
    current: number;
    onChange: (page: number) => void;
  }
>;

const Paginator = React.forwardRef<HTMLDivElement, PaginatorProps>(
  (props, ref) => {
    const { children, current, size, min, max, onChange, ...rest } = props;

    const mergedProps = mergeProps(
      {
        className: mergeClassNames("paginator"),
      },
      rest
    );

    const handleIncrement = (amount: number) => {
      const next = current + amount;
      if (next <= max && next >= min) onChange(next);
    };

    return (
      <ButtonGroup {...mergedProps}>
        <Button onClick={() => handleIncrement(-1)}>{"<"}</Button>
        {new Array(size).fill(0).map((_, i) => {
          const side = Math.floor(size / 2);
          let page =
            i +
            current -
            side +
            (current - side < min ? Math.abs(min - (current - side)) : 0) -
            (current + side > max ? Math.abs(max - (current + side)) : 0);

          return (
            <Button
              key={page}
              onClick={() => onChange(page)}
              color={page === current ? "primary" : "secondary"}
            >
              {page}
            </Button>
          );
        })}
        <Button onClick={() => handleIncrement(1)}>{">"}</Button>
      </ButtonGroup>
    );
  }
);

export default Paginator;
