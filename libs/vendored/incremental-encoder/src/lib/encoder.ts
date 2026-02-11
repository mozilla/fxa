/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RADIX } from './constants';

export const encode = (dictionary: string[]) => {
  return dictionary
    .map((entry) => entry.trim())
    .filter((entry) => !!entry.length)
    .sort()
    .reduce(
      (
        result: string[],
        entry: string,
        index: number,
        dictionary: string[]
      ) => {
        if (index === 0) {
          result.push(`0${entry}`);
        } else {
          const prev: string = dictionary[index - 1];
          const commonPrefix = findCommonPrefix(prev, entry);
          if (commonPrefix.length >= RADIX) {
            throw new Error(
              `Cannot encode ${entry}, ${RADIX} or more characters are shared with the previous word`
            );
          }
          result.push(
            `${commonPrefix.length.toString(RADIX)}${entry.slice(
              commonPrefix.length
            )}`
          );
        }
        return result;
      },
      []
    );
};

const findCommonPrefix = (first: string, second: string): string => {
  let prefix = '';
  const max = Math.min(first.length, second.length);
  for (let i = 0; i < max; ++i) {
    if (first.charAt(i) === second.charAt(i)) {
      prefix += first.charAt(i);
    } else {
      return prefix;
    }
  }
  return prefix;
};
