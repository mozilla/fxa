/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildEnvelopeContext } from './context';

const UID = '0011223344556677889900aabbccddee';
const CREDENTIAL_ID = 'cGFzc2tleS1jcmVkZW50aWFsLWlk';
const KEYS_CHANGED_AT = 1767225600000;

const context = (overrides = {}) =>
  buildEnvelopeContext({
    uid: UID,
    credentialId: CREDENTIAL_ID,
    keysChangedAt: KEYS_CHANGED_AT,
    ...overrides,
  });

describe('passkey-crypto context', () => {
  describe('framing', () => {
    // Length prefixes are insurance, not a fix for a live bug: uid is validated
    // to a fixed 16 bytes, so `uid || credentialId` is already unambiguous
    // today. The prefixes mean that stays true if a variable-length field is
    // ever added to the context, where plain concatenation would silently start
    // letting two different inputs frame to the same bytes.
    it('gives distinct output for distinct inputs', () => {
      const other = context({ credentialId: 'b3RoZXItY3JlZGVudGlhbA' });

      expect(Buffer.from(other.info).toString('hex')).not.toBe(
        Buffer.from(context().info).toString('hex')
      );
    });

    it('encodes each component with its length, so the parse is unambiguous', () => {
      // 0x0010 = 16-byte uid, 0x0015 = 21-byte credentialId.
      expect(Buffer.from(context().info).toString('hex')).toMatch(
        /^0010[0-9a-f]{32}0015[0-9a-f]{42}$/
      );
    });

    it('is deterministic for the same inputs', () => {
      expect(Buffer.from(context().info)).toEqual(Buffer.from(context().info));
    });
  });

  describe('kB generation binding', () => {
    it('changes hpkeAad when keysChangedAt changes', () => {
      expect(Buffer.from(context().hpkeAad).toString('hex')).not.toBe(
        Buffer.from(
          context({ keysChangedAt: KEYS_CHANGED_AT + 1 }).hpkeAad
        ).toString('hex')
      );
    });

    /**
     * Rotation re-seals `kB` to the stored `pkR` without the authenticator, so
     * it has no `prfOut` and cannot re-wrap `skR`. If `keysChangedAt` reached
     * this layer, every password reset would lock the credential out.
     */
    it('leaves keyWrapAad unchanged when keysChangedAt changes', () => {
      expect(Buffer.from(context().keyWrapAad).toString('hex')).toBe(
        Buffer.from(
          context({ keysChangedAt: KEYS_CHANGED_AT + 1 }).keyWrapAad
        ).toString('hex')
      );
    });

    it('changes keyWrapAad when the credential changes', () => {
      expect(Buffer.from(context().keyWrapAad).toString('hex')).not.toBe(
        Buffer.from(
          context({ credentialId: 'b3RoZXItY3JlZGVudGlhbA' }).keyWrapAad
        ).toString('hex')
      );
    });

    it('changes keyWrapAad when the account changes', () => {
      expect(Buffer.from(context().keyWrapAad).toString('hex')).not.toBe(
        Buffer.from(
          context({ uid: 'ffeeddccbbaa00998877665544332211' }).keyWrapAad
        ).toString('hex')
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
      expect(() => context({ uid })).toThrow();
    });

    it.each([
      ['standard base64 padding', 'cGFzc2tleS1jcmVkZW50aWFs=='],
      ['standard base64 alphabet', 'cGFzc2tleS9jcmVk+250aWFs'],
      ['empty', ''],
    ])('rejects a credentialId with %s', (_label, credentialId) => {
      expect(() => context({ credentialId })).toThrow();
    });

    it.each([
      ['negative', -1],
      ['fractional', 1.5],
      ['beyond safe integer range', Number.MAX_SAFE_INTEGER + 2],
    ])('rejects a keysChangedAt that is %s', (_label, keysChangedAt) => {
      expect(() => context({ keysChangedAt })).toThrow();
    });

    it('accepts a keysChangedAt of zero', () => {
      expect(() => context({ keysChangedAt: 0 })).not.toThrow();
    });
  });
});
