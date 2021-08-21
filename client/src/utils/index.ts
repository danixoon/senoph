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

type ExtractOnly<T, P> = UnionToIntersection<
  { [K in keyof T]: K } extends {
    [key: string]: infer V;
  }
    ? V extends keyof T
      ? T[V] extends P
        ? { [K in V]: T[V] }
        : never
      : never
    : never
>;

// type Ex = ExtractOnly<{ owo: string; name: number }, string>;
// type keys = keyof Ex;

export const groupBy = <T, K extends keyof T>(
  list: T[],
  getKey: (value: T) => any
) => {
  const map = new Map<any, T[]>();
  for (const item of list) {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }

  return map;
};

// export const groupBy = <
//   T,
//   K extends keyof ExtractOnly<T, string | boolean | number>,
//   P extends K extends keyof T ? K : never
// >(
//   list: T[],
//   key: K
// ) =>
//   list.reduce(
//     (p, c) => ({
//       ...p,
//       [(c as any)[key]]: [...((p as any)[(p as any)[key]] ?? []), c],
//     }),
//     {} as Record<T[P], T[]>
//   );

// export const t = groupBy(
//   [
//     { owo: true, foo: "sv" },
//     { owo: false, foo: "sf" },
//   ],
//   "owo"
// );

// console.log(t);
