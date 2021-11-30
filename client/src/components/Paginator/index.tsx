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

    const noMarginX = { marginLeft: 0, marginRight: 0 };

    const pages = new Array(size)
      .fill(0)
      .map((_, i) => {
        let center = Math.floor(size / 2);
        let page =
          i +
          current -
          center +
          (current - center < min ? Math.abs(min - (current - center)) : 0) -
          (current + center > max ? Math.abs(max - (current + center)) : 0);

        return page < min || page > max ? null : (
          <Button
            key={page}
            onClick={() => onChange(page)}
            style={noMarginX}
            color={page === current ? "primary" : "secondary"}
          >
            {page}
          </Button>
        );
      })
      .filter((v) => v);

    if (pages.length <= 1) return <> </>;

    return (
      <ButtonGroup {...mergedProps}>
        <Button style={noMarginX} onClick={() => handleIncrement(-1)}>
          {"<"}
        </Button>
        {pages}
        <Button style={noMarginX} onClick={() => handleIncrement(1)}>
          {">"}
        </Button>
      </ButtonGroup>
    );
  }
);

export default Paginator;
