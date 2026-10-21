/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { pairingCodeCacheKey } from './pairing-code';

describe('pairingCodeCacheKey', () => {
  it('namespaces the code hash', () => {
    expect(pairingCodeCacheKey('ab'.repeat(32))).toBe(
      `pairingCode:${'ab'.repeat(32)}`
    );
  });
});
