/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as passkeyCrypto from './index';

describe('passkey-crypto barrel', () => {
  /**
   * The module boundary is what keeps `CryptoKey`s, the raw crypto layers and
   * the frozen context construction inside. Widening this list is how that
   * comes undone, so the list is asserted exactly rather than by exclusion.
   */
  it('exports only the two envelope operations', () => {
    expect(Object.keys(passkeyCrypto).sort()).toEqual([
      'createWrapEnvelope',
      'openWrapEnvelope',
    ]);
  });
});
