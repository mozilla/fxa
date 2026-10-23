/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hasPasswordReauth } from './session-reauth';

describe('hasPasswordReauth', () => {
  const createdAt = 1_699_999_000_000;

  it('is true once /session/reauth has moved authAt past createdAt', () => {
    expect(hasPasswordReauth({ createdAt, authAt: createdAt + 1 })).toBe(true);
  });

  // The read path coalesces a null column to createdAt.
  it('is false when authAt equals createdAt', () => {
    expect(hasPasswordReauth({ createdAt, authAt: createdAt })).toBe(false);
  });

  it('is false when authAt is unset', () => {
    expect(hasPasswordReauth({ createdAt, authAt: 0 })).toBe(false);
  });
});
