declare type WithFilter<F> = {
  filter: F & { amount: number; offset: number };
};

declare type WithItems<I> = {
  items: I[];
};

declare type PartialNullable<T> = { [P in keyof T]: T[P] | null };

declare type StoreType = ReturnType<typeof import("./index").store.getState>;
