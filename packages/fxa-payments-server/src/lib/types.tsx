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
