import React from "react";
import * as Feather from "react-feather";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import "./styles.styl";
import { withAltLabel, WithAltLabel } from "hoc/withAltLabel";

export type IconProps = OverrideProps<
  Feather.IconProps,
  {
    size?: Size;
  }
>;

const Icon: {
  [K in keyof typeof Feather]: React.FC<IconProps & WithAltLabel>;
} = new Proxy(Feather, {
  get: (t: any, p: any) => {
    const IconComponent = t[p] as Feather.Icon;
    return (props: IconProps) => {
      const { size = "sm", color, ...rest } = props;

      const mergedProps = mergeProps(
        {
          className: mergeClassNames("icon", `icon_${size}`, `col_${color}`),
        },
        rest
      );

      const IconWithLabel = withAltLabel(IconComponent);

      return <IconWithLabel {...mergedProps} width="auto" />;
    };
  },
});

// (props) => {
//   const { ...rest } = props;

//   const mergedProps = mergeProps(
//     {
//       className: mergeClassNames("icon"),
//     },
//     rest
//   );

//   return;
// };

export default Icon;
