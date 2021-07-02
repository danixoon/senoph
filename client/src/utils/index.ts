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

export const denullObject = function <T>(obj: T) {
  const filtered = { ...obj };
  for (const k in filtered) if (filtered[k] === null) delete filtered[k];

  return filtered as { [K in keyof T]: Exclude<T[K], null> };
};

// Deletes empty arrays, strings & null values
export const clearObject = function <T>(obj: T) {
  const filtered = { ...obj };
  for (const k in filtered) {
    const v = filtered[k];
    if (Array.isArray(v) && v.length === 0) delete filtered[k];
    else if (typeof v === "string" && v.trim().length === 0) delete filtered[k];
    else if (v === null) delete filtered[k];
  }

  return filtered as { [K in keyof T]: Exclude<T[K], null> };
};
