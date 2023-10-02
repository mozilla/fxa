export type DeepNonNullable<T> = {
  [K in keyof T]: Exclude<DeepNonNullable<T[K]>, null | undefined>;
};
