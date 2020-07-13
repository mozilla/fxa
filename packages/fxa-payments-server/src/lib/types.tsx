export interface QueryParams {
  plan?: string;
  activated?: string;
  device_id?: string;
  flow_id?: string;
  flow_begin_time?: number;
}

export interface GenericObject {
  [propName: string]: any;
}

// https://stackoverflow.com/questions/48215950/exclude-property-from-type
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Relaxed type derived from a Function where we ignore the return value
// in actual use. Makes it easier to write mocks.
export type FunctionWithIgnoredReturn<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => unknown;

export type PromiseResolved<T> = T extends Promise<infer U> ? U : T;

export type PickPartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
