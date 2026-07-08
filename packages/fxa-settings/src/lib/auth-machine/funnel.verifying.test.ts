/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { funnelReducer } from './funnel';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { makeCtx as ctx } from './mocks';

describe('funnelReducer: verifying', () => {
  // The verifying.router decision matrix. Each row enters the router with a
  // resolved auth event (from SIGNIN_OK / UNBLOCK_OK / CACHED_RESULT — the
  // router treats all three identically) and asserts the next state.
  //
  // Key rules under test:
  //  - finalize only when email AND session are verified (legacy isFullyVerified).
  //  - needsTotp safety net (FXA-12084): a live accountHasTotp wins over an
  //    echoed EMAIL_OTP method, on every entry path (signin/unblock/cached).
  //  - SIGN_UP always delegates to legacy (→ /confirm_signup_code).
  it.each([
    {
      name: 'method=TOTP → totp',
      event: { sessionVerified: false, method: VerificationMethods.TOTP_2FA },
      ctx: {},
      expected: 'verifying.totp',
    },
    {
      name: 'live accountHasTotp beats EMAIL_OTP → totp (safety net)',
      event: { sessionVerified: false, method: VerificationMethods.EMAIL_OTP },
      ctx: { accountHasTotp: true },
      expected: 'verifying.totp',
    },
    {
      name: 'SIGN_UP with verified email → delegated.legacy',
      event: {
        sessionVerified: false,
        method: VerificationMethods.EMAIL_OTP,
        reason: VerificationReasons.SIGN_UP,
      },
      ctx: {},
      expected: 'delegated.legacy',
    },
    {
      name: 'SIGN_UP with unverified email → delegated.legacy',
      event: {
        emailVerified: false,
        sessionVerified: false,
        method: VerificationMethods.EMAIL_OTP,
        reason: VerificationReasons.SIGN_UP,
      },
      ctx: { emailVerified: false },
      expected: 'delegated.legacy',
    },
    {
      name: 'verified email, no totp → emailTokenCode',
      event: { sessionVerified: false, method: VerificationMethods.EMAIL_OTP },
      ctx: {},
      expected: 'verifying.emailTokenCode',
    },
    {
      name: 'fully verified → handoff',
      event: { sessionVerified: true, method: VerificationMethods.EMAIL_OTP },
      ctx: {},
      expected: 'finalizing.handoff',
    },
    {
      name: 'fully verified even with totp → handoff',
      event: { sessionVerified: true, method: VerificationMethods.EMAIL_OTP },
      ctx: { accountHasTotp: true },
      expected: 'finalizing.handoff',
    },
    {
      name: 'verified session but unverified email → delegated.legacy',
      event: {
        emailVerified: false,
        sessionVerified: true,
        method: VerificationMethods.EMAIL_OTP,
      },
      ctx: { emailVerified: false },
      expected: 'delegated.legacy',
    },
  ])('router (SIGNIN_OK): $name', ({ event, ctx: over, expected }) => {
    const r = funnelReducer(
      'verifying.router',
      {
        type: 'SIGNIN_OK',
        emailVerified: event.emailVerified ?? true,
        sessionVerified: event.sessionVerified,
        verificationMethod: event.method,
        verificationReason: event.reason,
      },
      ctx(over)
    );
    expect(r.state).toBe(expected);
  });

  // The safety net must fire regardless of which event re-enters the router.
  it.each(['UNBLOCK_OK', 'CACHED_RESULT'] as const)(
    'router (%s) with accountHasTotp → totp (per-path safety net)',
    (type) => {
      const r = funnelReducer(
        'verifying.router',
        {
          type,
          emailVerified: true,
          sessionVerified: false,
          verificationMethod: VerificationMethods.EMAIL_OTP,
        },
        ctx({ accountHasTotp: true })
      );
      expect(r.state).toBe('verifying.totp');
    }
  );

  it('router + CACHED_RESULT no totp, emailVerified → emailTokenCode', () => {
    const r = funnelReducer(
      'verifying.router',
      {
        type: 'CACHED_RESULT',
        emailVerified: true,
        sessionVerified: false,
        verificationMethod: VerificationMethods.EMAIL_OTP,
      },
      ctx()
    );
    expect(r.state).toBe('verifying.emailTokenCode');
  });

  it('unblock OK auto-advances through the router to totp (carrying the server method, totp-2fa)', () => {
    const r = funnelReducer(
      'verifying.unblock',
      {
        type: 'UNBLOCK_OK',
        emailVerified: true,
        sessionVerified: false,
        verificationMethod: VerificationMethods.TOTP_2FA,
      },
      ctx({ accountHasTotp: true })
    );
    expect(r.state).toBe('verifying.totp');
  });

  it('totp success finalizes (handoff)', () => {
    const r = funnelReducer(
      'verifying.totp',
      { type: 'CODE_OK' },
      ctx({ sessionVerified: true })
    );
    expect(r.state).toBe('finalizing.handoff');
  });

  it('recovery choice routes to phone/code', () => {
    expect(
      funnelReducer(
        'verifying.recoveryChoice',
        { type: 'CHOOSE_RECOVERY_PHONE' },
        ctx()
      ).state
    ).toBe('verifying.recoveryPhone');
    expect(
      funnelReducer(
        'verifying.recoveryChoice',
        { type: 'CHOOSE_RECOVERY_CODE' },
        ctx()
      ).state
    ).toBe('verifying.recoveryCode');
  });
});
