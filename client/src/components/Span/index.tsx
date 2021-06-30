import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

type SpanProps = OverrideProps<
  {
    color?: "secondary" | "primary";
    font?: "monospace" | "normal" | "italic";
    size?: Size;
  },
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
>;

const Span: React.FC<SpanProps> = (props) => {
  const { children, color = "secondary", font = "normal", size = "sm", ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "span",
        `span_${color}`,
        `span_${font}`,
        `span_${size}`
      ),
    },
    rest
  );

  return <span {...mergedProps}>{children}</span>;
};

export default withAltLabel(Span);
