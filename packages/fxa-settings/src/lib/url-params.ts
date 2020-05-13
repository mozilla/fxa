import { Hash } from './types';

export const parseParams = (params: string): Hash<string> =>
  params
    .substr(1)
    .split('&')
    .reduce((acc: Hash<string>, curr: string) => {
      const parts = curr.split('=').map(decodeURIComponent);
      acc[parts[0]] = parts[1];
      return acc;
    }, {});
