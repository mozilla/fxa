// TODO: Maybe flesh this out to match a convict config definition?
export interface Config {
  [propName: string]: any;
};

export interface QueryParams {
  [propName: string]: string;
};

export interface GenericObject {
  [propName: string]: any
}