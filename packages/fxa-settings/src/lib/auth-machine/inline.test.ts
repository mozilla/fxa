/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { routeAfterInlineTotpSetup, InlineTotpSetupFacts } from './inline';

describe('routeAfterInlineTotpSetup', () => {
  const base: InlineTotpSetupFacts = {
    isSignedIn: true,
    hasSigninState: true,
    totpVerified: false,
    sessionVerified: true,
  };

  it('routes to / when the user is not signed in', () => {
    expect(routeAfterInlineTotpSetup({ ...base, isSignedIn: false })).toBe('/');
  });

  it('routes to / when signin state is absent', () => {
    expect(routeAfterInlineTotpSetup({ ...base, hasSigninState: false })).toBe(
      '/'
    );
  });

  it('routes to / when both isSignedIn and hasSigninState are false', () => {
    expect(
      routeAfterInlineTotpSetup({
        ...base,
        isSignedIn: false,
        hasSigninState: false,
      })
    ).toBe('/');
  });

  it('routes to /signin_totp_code when TOTP is already verified', () => {
    expect(routeAfterInlineTotpSetup({ ...base, totpVerified: true })).toBe(
      '/signin_totp_code'
    );
  });

  it('routes to /signin_totp_code when TOTP is verified even if session is also unverified', () => {
    // TOTP-verified check has higher priority than session-unverified check.
    expect(
      routeAfterInlineTotpSetup({
        ...base,
        totpVerified: true,
        sessionVerified: false,
      })
    ).toBe('/signin_totp_code');
  });

  it('routes to /signin_token_code when the session is not verified', () => {
    expect(routeAfterInlineTotpSetup({ ...base, sessionVerified: false })).toBe(
      '/signin_token_code'
    );
  });

  it('returns null when signed in, state present, TOTP not verified, and session is verified', () => {
    // No redirect needed; the TOTP setup UI should be shown.
    expect(routeAfterInlineTotpSetup(base)).toBeNull();
  });

  it('returns null when sessionVerified is undefined (check still in-flight)', () => {
    expect(
      routeAfterInlineTotpSetup({ ...base, sessionVerified: undefined })
    ).toBeNull();
  });

  it('returns null when totpVerified is undefined (status check still in-flight)', () => {
    expect(
      routeAfterInlineTotpSetup({ ...base, totpVerified: undefined })
    ).toBeNull();
  });
});
