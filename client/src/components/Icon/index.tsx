import React from "react";
import * as Feather from "react-feather";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import "./styles.styl";

export type IconProps = OverrideProps<
  Feather.IconProps,
  {
    size?: Size;
  }
>;

const Icon: {
  [K in keyof typeof Feather]: React.FC<IconProps>;
} = new Proxy(Feather, {
  get: (t: any, p: any) => {
    const IconComponent = t[p];
    return (props: IconProps) => {
      const { size = "sm", ...rest } = props;

      const mergedProps = mergeProps(
        {
          className: mergeClassNames("icon", `icon_${size}`),
        },
        rest
      );

      return <IconComponent {...mergedProps} />;
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
