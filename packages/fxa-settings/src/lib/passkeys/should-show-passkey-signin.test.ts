/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  passkeySigninFeatureEnabled,
  shouldShowPasskeySignin,
} from './should-show-passkey-signin';

const flagsOn = {
  featureFlags: {
    passkeysEnabled: true,
    passkeyAuthenticationEnabled: true,
  },
};

describe('passkeySigninFeatureEnabled', () => {
  it('returns true when both passkey flags are enabled', () => {
    expect(passkeySigninFeatureEnabled(flagsOn)).toBe(true);
  });

  it('returns false when passkeysEnabled is false', () => {
    expect(
      passkeySigninFeatureEnabled({
        featureFlags: {
          passkeysEnabled: false,
          passkeyAuthenticationEnabled: true,
        },
      })
    ).toBe(false);
  });

  it('returns false when passkeyAuthenticationEnabled is false', () => {
    expect(
      passkeySigninFeatureEnabled({
        featureFlags: {
          passkeysEnabled: true,
          passkeyAuthenticationEnabled: false,
        },
      })
    ).toBe(false);
  });

  it('returns false when featureFlags is absent', () => {
    expect(passkeySigninFeatureEnabled({})).toBe(false);
  });
});

describe('shouldShowPasskeySignin', () => {
  it('returns true when flags are enabled and hasPasskey is true', () => {
    expect(shouldShowPasskeySignin(flagsOn, { hasPasskey: true })).toBe(true);
  });

  it('returns false when hasPasskey is false', () => {
    expect(shouldShowPasskeySignin(flagsOn, { hasPasskey: false })).toBe(false);
  });

  it('returns false when hasPasskey is undefined (fails closed)', () => {
    expect(shouldShowPasskeySignin(flagsOn, { hasPasskey: undefined })).toBe(
      false
    );
  });

  // isSignup + hasPasskey shouldn't co-occur in practice (a signup has no
  // account yet), but the helper must still fail closed if it ever does.
  it('fails closed when isSignup is true, even with hasPasskey true', () => {
    expect(
      shouldShowPasskeySignin(flagsOn, { hasPasskey: true, isSignup: true })
    ).toBe(false);
  });

  it('returns false when passkeysEnabled is false, even with hasPasskey true', () => {
    const config = {
      featureFlags: {
        passkeysEnabled: false,
        passkeyAuthenticationEnabled: true,
      },
    };
    expect(shouldShowPasskeySignin(config, { hasPasskey: true })).toBe(false);
  });

  it('returns false when passkeyAuthenticationEnabled is false, even with hasPasskey true', () => {
    const config = {
      featureFlags: {
        passkeysEnabled: true,
        passkeyAuthenticationEnabled: false,
      },
    };
    expect(shouldShowPasskeySignin(config, { hasPasskey: true })).toBe(false);
  });

  it('returns false when featureFlags is absent, even with hasPasskey true', () => {
    expect(shouldShowPasskeySignin({}, { hasPasskey: true })).toBe(false);
  });

  it('returns false when isWebAuthnSupported is false, even with hasPasskey true', () => {
    expect(
      shouldShowPasskeySignin(flagsOn, {
        hasPasskey: true,
        isWebAuthnSupported: false,
      })
    ).toBe(false);
  });

  it('returns true when isWebAuthnSupported is explicitly true', () => {
    expect(
      shouldShowPasskeySignin(flagsOn, {
        hasPasskey: true,
        isWebAuthnSupported: true,
      })
    ).toBe(true);
  });

  it('defaults to supported when isWebAuthnSupported is omitted', () => {
    expect(shouldShowPasskeySignin(flagsOn, { hasPasskey: true })).toBe(true);
  });
});
