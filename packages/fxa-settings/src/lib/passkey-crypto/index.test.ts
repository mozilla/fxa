/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as passkeyCrypto from './index';

describe('passkey-crypto barrel', () => {
  /**
   * The suite traffics in `CryptoKey`s, and the module boundary exists to keep
   * them inside. `export *` makes that easy to undo by accident.
   */
  it('does not export the ciphersuite', () => {
    expect(Object.keys(passkeyCrypto)).not.toContain('suite');
  });

  it('exports the primitives callers need', () => {
    expect(Object.keys(passkeyCrypto).sort()).toEqual([
      'HPKE_MODE_BASE',
      'KB_BYTES',
      'KEY_WRAP_IV_BYTES',
      'KEY_WRAP_KDF_HASH',
      'PRF_OUT_BYTES',
      'RECIPIENT_ALGORITHM',
      'RECIPIENT_CURVE',
      'UID_BYTES',
      'V1_SIZES',
      'generateRecipientKeyPair',
      'openKb',
      'sealKb',
      'unwrapRecipientPrivateKey',
      'wrapRecipientPrivateKey',
    ]);
  });
});
