export type DeepNonNullable<T> = {
  // T extends never is a check for 'any' which is the type returned for Strapi multi-select plugin arrays
  [K in keyof T]: T[K] extends never
    ? any
    : Exclude<DeepNonNullable<T[K]>, null | undefined>;
};

/*
https://www.contentful.com/developers/docs/references/errors/
*/
export type ContentfulErrorResponse = {
  sys: {
    type: 'Error';
    id: string;
  };
  message: string;
  requestId: string;
  details?: NonNullable<unknown>;
};

export interface StrapiEntity<T> {
  attributes: T;
}
