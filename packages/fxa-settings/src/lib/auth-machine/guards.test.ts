/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { guards } from './guards';
import VerificationMethods from '../../constants/verification-methods';
import { makeCtx } from './mocks';

const base = makeCtx();

describe('guards', () => {
  it('requiresPasswordForLogin: Sync always true', () => {
    expect(
      guards.requiresPasswordForLogin({ ...base, requiresKeys: true })
    ).toBe(true);
  });

  it('requiresPasswordForLogin: keys-optional browser is respected', () => {
    expect(
      guards.requiresPasswordForLogin({
        ...base,
        requiresKeys: false,
        wantsKeysIfPasswordEntered: true,
        supportsKeysOptionalLogin: true,
      })
    ).toBe(false);
  });

  it('needsTotp is true when the live account has TOTP even if the method says email-otp (R-18 safety net)', () => {
    expect(
      guards.needsTotp({
        ...base,
        accountHasTotp: true,
        verificationMethod: VerificationMethods.EMAIL_OTP,
      })
    ).toBe(true);
  });

  it('shouldRedirectToPasswordless requires no password, no linked account, no cached session', () => {
    expect(
      guards.shouldRedirectToPasswordless({
        ...base,
        passwordlessSupported: true,
        hasPassword: false,
        hasLinkedAccount: false,
        hasCachedSession: false,
      })
    ).toBe(true);
    expect(
      guards.shouldRedirectToPasswordless({
        ...base,
        passwordlessSupported: true,
        hasPassword: false,
        hasLinkedAccount: true,
      })
    ).toBe(false);
  });

  it('canUpgradeCredentials is false without a password (cached/passwordless/passkey)', () => {
    expect(guards.canUpgradeCredentials({ ...base, hasPassword: false })).toBe(
      false
    );
  });

  it('isFullyVerified conjoins email and session', () => {
    expect(
      guards.isFullyVerified({
        ...base,
        emailVerified: true,
        sessionVerified: true,
      })
    ).toBe(true);
    expect(
      guards.isFullyVerified({
        ...base,
        emailVerified: true,
        sessionVerified: false,
      })
    ).toBe(false);
  });
});
