import React from "react";
import * as Feather from "react-feather";
import { mergeClassNames, mergeProps } from "utils";
import { ReactComponent } from "icons/toggle.svg";
import { ReactComponent as Loader } from "icons/loader.svg";
import "./styles.styl";
import { withAltLabel, WithAltLabel } from "hoc/withAltLabel";
import { GetProps } from "react-redux";

export type IconProps = OverrideProps<
  Feather.IconProps,
  {
    size?: Size;
    inline?: boolean;
  }
>;

const Icon: {
  [K in keyof typeof Feather]: React.FC<IconProps & WithAltLabel>;
} = new Proxy(Feather, {
  get: (t: any, p: any) => {
    const IconComponent = t[p] as Feather.Icon;
    return (props: IconProps) => {
      const { size = "sm", inline, color, ...rest } = props;

      const mergedProps = mergeProps(
        {
          className: mergeClassNames(
            "icon",
            `icon_${size}`,
            inline && `icon_inline`,
            `col_${color}`
          ),
        },
        rest
      );

      const IconWithLabel = withAltLabel(IconComponent);

      return <IconWithLabel {...mergedProps} />;
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

export const LoaderIcon: React.FC<GetProps<typeof Loader> & { size?: Size }> = (
  props
) => {
  const { className, size, ...rest } = props;
  return (
    <Loader
      {...rest}
      className={mergeClassNames(
        className,
        "loader-icon",
        size && "icon_" + size
      )}
    />
  );
};
export default Icon;
