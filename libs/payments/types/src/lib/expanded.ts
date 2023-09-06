import { NonString } from './nonstring';

export type Expanded<T, K extends string> = Omit<T, K> & {
  [P in Extract<keyof T, K>]: NonString<T[P]>;
};
