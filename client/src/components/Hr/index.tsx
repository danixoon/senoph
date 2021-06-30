import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import "./styles.styl";

export type HrProps = OverrideProps<
  React.HTMLAttributes<HTMLHRElement>,
  {
    vertical?: boolean;
  }
>;

const Hr: React.FC<HrProps> = (props) => {
  const { vertical, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "hr",
        `hr_${vertical ? "vertical" : "horizontal"}`
      ),
    },
    rest
  );

  return <hr {...mergedProps} />;
};

export default Hr;
