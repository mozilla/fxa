/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { chunk } from './chunk';

describe('chunk', () => {
  it('splits a list into chunks of the given size', () => {
    expect(chunk(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
  });

  it('returns no chunks for an empty list', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it('returns one chunk when the list fits within the size', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });
});
