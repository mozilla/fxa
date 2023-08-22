export type NonString<T> = T extends string ? never : T;
