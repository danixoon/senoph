type FilterProps<F> = F & { amount: number; offset: number };

declare type WithFilter<F> = { amount: number; offset: number } & F;

declare type WithItems<I> = {
  items: I[];
};

declare type PartialNullable<T> = PartialType<T, null>;
declare type PartialType<T, K> = { [P in keyof T]: T[P] | K };

declare type StoreType = ReturnType<typeof import("./index").store.getState>;

declare type ActionStatus = "idle" | "loading" | "success" | Api.Error;
declare type WithStatus<K extends string = "status"> = {
  [k in K]: ActionStatus;
};
declare type ApiStatus =
  // | { isError: true; error: Api.Error }
  {
    error: Api.Error | null;
    isLoading: boolean;
    isIdle: boolean;
    isSuccess: boolean;
    isError: boolean;
    status?: "idle" | "loading" | "success" | "error";
  };
