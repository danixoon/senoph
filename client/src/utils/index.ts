// import { getAction } from "../redux/types";

import { extractStatus } from "store/utils";

export const getLocalDate = (checkDate?: Date | string) => {
  let date: Date | undefined =
    typeof checkDate === "string" ? new Date(checkDate) : checkDate;

  if (!date || isNaN(date.getTime())) return "Не определено";

  const isCurrentDay = () => {
    const current = new Date();
    const [day, month, year] = [
      current.getDay(),
      current.getMonth(),
      current.getFullYear(),
    ];
    const [_day, _month, _year] = [
      date?.getDay(),
      date?.getMonth(),
      date?.getFullYear(),
    ];

    return _day === day && _month === month && _year === year;
  };

  return isCurrentDay()
    ? date.toTimeString().split(/\s+/)[0]
    : date.toLocaleDateString();
};

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
    ...(newProps ?? ({} as any)),
    className: mergeClassNames(
      ownProps.className,
      (newProps as MergingProps)?.className
    ),
    style: {
      ...(ownProps.style ?? ({} as any)),
      ...((newProps as MergingProps)?.style ?? {}),
    },
  };
};

export const denullObject = function <T>(obj: T) {
  const filtered = { ...obj };
  for (const k in filtered)
    if (filtered[k] === null || (filtered[k] as any) === "null")
      delete filtered[k];

  return filtered as { [K in keyof T]: Exclude<T[K], null> };
};

// Deletes empty arrays, strings & null values
export const clearObject = function <T>(obj: T) {
  const filtered = { ...obj };
  for (const k in filtered) {
    const v = filtered[k];
    if (v === undefined) delete filtered[k];
    if (typeof v === "number") if (isNaN(v)) delete filtered[k];
    if (Array.isArray(v) && v.length === 0) delete filtered[k];
    else if (typeof v === "string" && v.trim().length === 0) delete filtered[k];
    else if (v === null) delete filtered[k];
  }

  return filtered as { [K in keyof T]: Exclude<T[K], null | undefined> };
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

export function isResponse<T extends any>(res: T): res is Exclude<T, void> {
  return typeof res !== "undefined";
}

export const extractItemsHook = <T>(hook: {
  data?: ItemsResponse<T>;
  isError?: boolean;
  isLoading?: boolean;
  isIdle?: boolean;
  isSuccess?: boolean;
  isFetching?: boolean;
  error?: any;
}) => {
  const status = extractStatus(hook);
  const items = hook.data ?? { items: [], offset: 0, total: 0 };

  return { status, items };
};
