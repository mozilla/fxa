/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bindingBytes } from './encoding';

const UID = '0011223344556677889900aabbccddee';
const CREDENTIAL_ID = 'cGFzc2tleS1jcmVkZW50aWFsLWlk';

const binding = (overrides = {}) =>
  Buffer.from(
    bindingBytes({ uid: UID, credentialId: CREDENTIAL_ID, ...overrides })
  ).toString('hex');

describe('passkey-crypto encoding', () => {
  describe('framing', () => {
    // Insurance, not a fix for a live bug: uid is a fixed 16 bytes, so the
    // concatenation is already unambiguous. The prefixes keep it that way if a
    // variable-length field is ever added.
    it('encodes each component with its length, so the parse is unambiguous', () => {
      // 0x0010 = 16-byte uid, 0x0015 = 21-byte credentialId.
      expect(binding()).toMatch(/^0010[0-9a-f]{32}0015[0-9a-f]{42}$/);
    });

    it('is deterministic for the same inputs', () => {
      expect(binding()).toBe(binding());
    });

    it('changes when the credential changes', () => {
      expect(binding({ credentialId: 'b3RoZXItY3JlZGVudGlhbA' })).not.toBe(
        binding()
      );
    });

    it('changes when the account changes', () => {
      expect(binding({ uid: 'ffeeddccbbaa00998877665544332211' })).not.toBe(
        binding()
      );
    });
  });

  describe('input validation', () => {
    it.each([
      ['not hex', 'zzeeddccbbaa00998877665544332211'],
      ['odd length', '0011223344556677889900aabbccdde'],
      ['too short', '00112233445566778899'],
      ['too long', '0011223344556677889900aabbccddeeff'],
    ])('rejects a uid that is %s', (_label, uid) => {
      expect(() => binding({ uid })).toThrow();
    });

    it.each([
      ['standard base64 padding', 'cGFzc2tleS1jcmVkZW50aWFs=='],
      ['standard base64 alphabet', 'cGFzc2tleS9jcmVk+250aWFs'],
      ['empty', ''],
    ])('rejects a credentialId with %s', (_label, credentialId) => {
      expect(() => binding({ credentialId })).toThrow();
    });
  });
});
