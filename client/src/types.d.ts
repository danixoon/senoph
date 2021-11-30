type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module "*.svg" {
  const content: string;
  export const ReactComponent: SvgrComponent;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}


declare type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType[number];

declare type Action<T extends keyof Payloads = keyof Payloads> = {
  type: T;
  payload: Payloads[T];
};

type CreateAction<I, S, L = {}> = {
  initial: I;
  loading: L;
  success: S;
};

declare type Payloads = {
  USER_LOGIN: CreateAction<
    { username: string; password: string },
    { token: string }
  >;
};

declare type GetPayload<
  T extends keyof Payloads,
  S extends "initial" | "loading" | "success"
> = Payloads[T] extends CreateAction<infer IP, infer SP, infer LP>
  ? S extends "initial"
    ? IP
    : S extends "loading"
    ? LP
    : S extends "success"
    ? SP
    : never
  : never;

declare type ActionEnum = {
  [T in keyof Payloads]: {
    [S in "initial" | "loading" | "success"]: ((payload: GetPayload<T, S>) => {
      type: string;
      payload: typeof payload;
    }) & { type: string };
  };
};

declare type StateSchema<
  T = {},
  A extends string | null = null,
  S extends string | null = null
> = {
  _action: A | null;
  _error: any | null;
  _status: S;
} & T;

declare type OverrideProps<F, T> = Omit<F, keyof T> & T;

declare type HookOnChange = (e: {
  target: { name: string; type?: string; value: any; files?: FileList | null };
}) => void;

declare type StateCreator<T extends object> = () => T;

declare type ContainerProps<T> =
  T extends import("react-redux").ConnectedComponent<infer _, infer P>
    ? P
    : never;

declare type QueryError = {
  message: string;
  code: number;
};

declare type QueryHook<T> = [
  T,
  { isFetching: boolean; error: null | QueryError[] }
];

declare type SortDir = "asc" | "desc";
declare type Size = "none" | "xs" | "sm" | "md" | "lg";
