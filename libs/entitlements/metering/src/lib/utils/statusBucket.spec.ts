/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { statusBucket } from './statusBucket';

describe('statusBucket', () => {
  it.each([
    [200, '2xx'],
    [299, '2xx'],
    [301, '3xx'],
    [404, '4xx'],
    [500, '5xx'],
    [599, '5xx'],
    [0, 'other'],
    [600, 'other'],
  ])('buckets %i as %s', (status, expected) => {
    expect(statusBucket(status)).toBe(expected);
  });
});
