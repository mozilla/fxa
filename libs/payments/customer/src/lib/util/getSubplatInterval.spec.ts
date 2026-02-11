/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubplatInterval } from '../types';
import { getSubplatInterval } from './getSubplatInterval';

describe('getSubplatInterval', () => {
  it('returns the correct offering and interval', () => {
    expect(getSubplatInterval('month', 1)).toBe(SubplatInterval.Monthly);
  });

  it('does not find offering and interval', () => {
    expect(getSubplatInterval('notfound', 5)).toBe(undefined);
  });
});
