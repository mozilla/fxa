export interface QueryParams {
  device_id?: string;
  flow_id?: string;
  flow_begin_time?: number;
}

export type Hash<T> = { [key: string]: T };
