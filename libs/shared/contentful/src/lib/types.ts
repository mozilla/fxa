export type DeepNonNullable<T> = {
  [K in keyof T]: Exclude<DeepNonNullable<T[K]>, null | undefined>;
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
