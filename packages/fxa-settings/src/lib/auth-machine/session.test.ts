/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { routeSettingsAccess } from './session';

describe('routeSettingsAccess', () => {
  describe('email not verified', () => {
    it('redirects to / when emailVerified is false, sessionVerified is true, AAL is met', () => {
      expect(
        routeSettingsAccess({
          emailVerified: false,
          sessionVerified: true,
          sessionVerificationMeetsAAL: true,
        })
      ).toEqual({ kind: 'redirect', to: '/' });
    });

    it('redirects to / when emailVerified is false, sessionVerified is false, AAL is not met', () => {
      expect(
        routeSettingsAccess({
          emailVerified: false,
          sessionVerified: false,
          sessionVerificationMeetsAAL: false,
        })
      ).toEqual({ kind: 'redirect', to: '/' });
    });

    it('redirects to / when emailVerified is false even if AAL is not met (email check wins)', () => {
      expect(
        routeSettingsAccess({
          emailVerified: false,
          sessionVerified: true,
          sessionVerificationMeetsAAL: false,
        })
      ).toEqual({ kind: 'redirect', to: '/' });
    });
  });

  describe('session not verified', () => {
    it('redirects to / when sessionVerified is false, emailVerified is true, AAL is met', () => {
      expect(
        routeSettingsAccess({
          emailVerified: true,
          sessionVerified: false,
          sessionVerificationMeetsAAL: true,
        })
      ).toEqual({ kind: 'redirect', to: '/' });
    });

    it('redirects to / when sessionVerified is false and AAL is not met', () => {
      expect(
        routeSettingsAccess({
          emailVerified: true,
          sessionVerified: false,
          sessionVerificationMeetsAAL: false,
        })
      ).toEqual({ kind: 'redirect', to: '/' });
    });
  });

  describe('AAL step-up required (security-critical)', () => {
    it('redirects to /signin_totp_code when email and session are verified but AAL is not met', () => {
      // This is the 2FA enforcement path: both verified, but the session has not
      // yet satisfied the account's minimum assurance level. Must redirect to TOTP.
      expect(
        routeSettingsAccess({
          emailVerified: true,
          sessionVerified: true,
          sessionVerificationMeetsAAL: false,
        })
      ).toEqual({ kind: 'redirect', to: '/signin_totp_code' });
    });
  });

  describe('allow access', () => {
    it('allows access when email verified, session verified, and AAL is met', () => {
      expect(
        routeSettingsAccess({
          emailVerified: true,
          sessionVerified: true,
          sessionVerificationMeetsAAL: true,
        })
      ).toEqual({ kind: 'allow' });
    });
  });
});
