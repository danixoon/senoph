// import { getAction } from "../redux/types";

export const mergeClassNames = (
  ...names: (string | undefined | boolean | null)[]
) => {
  return names.filter((name) => typeof name === "string").join(" ");
};

type MergingProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  "className" | "style"
>;

export const mergeProps = <P extends MergingProps, T>(
  ownProps: P = {} as P,
  newProps: T
): T & P => {
  return {
    ...ownProps,
    ...newProps,
    className: mergeClassNames(
      ownProps.className,
      (newProps as MergingProps).className
    ),
    style: {
      ...(ownProps.style ?? {}),
      ...((newProps as MergingProps).style ?? {}),
    },
  };
};
