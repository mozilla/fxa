/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PAIR_GLEAN_REASONS, isPairGleanReason } from './pair-reasons';

describe('isPairGleanReason', () => {
  it.each(PAIR_GLEAN_REASONS)('returns true for %s', (reason) => {
    expect(isPairGleanReason(reason)).toBe(true);
  });

  it.each(['unknown', '', undefined, 1])('returns false for %p', (value) => {
    expect(isPairGleanReason(value)).toBe(false);
  });
});
