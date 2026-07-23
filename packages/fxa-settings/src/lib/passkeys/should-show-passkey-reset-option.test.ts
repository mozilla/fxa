/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { shouldShowPasskeyResetOption } from './should-show-passkey-reset-option';

const flagsOn = {
  featureFlags: {
    passkeysEnabled: true,
    passkeyAuthenticationEnabled: true,
  },
};

const flagsOff = {
  featureFlags: {
    passkeysEnabled: false,
    passkeyAuthenticationEnabled: true,
  },
};

describe('shouldShowPasskeyResetOption', () => {
  describe('feature flag gating', () => {
    it('returns false when the passkey feature is off, even post-OTP with a passkey', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOff, {
          hasPasskey: true,
          requireHasPasskey: true,
        })
      ).toBe(false);
    });

    it('returns false when featureFlags is absent', () => {
      expect(shouldShowPasskeyResetOption({}, {})).toBe(false);
    });
  });

  describe('pre-OTP pages (requireHasPasskey false)', () => {
    it('returns true for a non-Sync user regardless of hasPasskey', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, { hasPasskey: undefined })
      ).toBe(true);
    });

    it('suppresses for a Sync flow (serviceRequiresKeys)', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, { serviceRequiresKeys: true })
      ).toBe(false);
    });
  });

  describe('post-OTP pages (requireHasPasskey true)', () => {
    it('returns true when hasPasskey is true and the user is not on Sync', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, {
          hasPasskey: true,
          requireHasPasskey: true,
        })
      ).toBe(true);
    });

    it('returns false when hasPasskey is false', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, {
          hasPasskey: false,
          requireHasPasskey: true,
        })
      ).toBe(false);
    });

    it('returns false when hasPasskey is undefined (fails closed)', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, {
          hasPasskey: undefined,
          requireHasPasskey: true,
        })
      ).toBe(false);
    });

    it('suppresses for a Sync flow even with a passkey', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, {
          hasPasskey: true,
          requireHasPasskey: true,
          serviceRequiresKeys: true,
        })
      ).toBe(false);
    });
  });

  describe('defaults', () => {
    it('treats serviceRequiresKeys as false when omitted', () => {
      expect(
        shouldShowPasskeyResetOption(flagsOn, {
          hasPasskey: true,
          requireHasPasskey: true,
        })
      ).toBe(true);
    });
  });
});
