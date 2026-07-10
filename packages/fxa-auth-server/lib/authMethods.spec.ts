/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError as error } from '@fxa/accounts/errors';
import * as authMethods from './authMethods';

const MOCK_ACCOUNT = {
  uid: 'abcdef123456',
};

describe('availableAuthenticationMethods', () => {
  let db: { totpToken: jest.Mock };

  beforeEach(() => {
    db = { totpToken: jest.fn() };
  });

  it('returns [`pwd`,`email`] for non-TOTP-enabled accounts', async () => {
    db.totpToken.mockRejectedValue(error.totpTokenNotFound());
    const amr = await authMethods.availableAuthenticationMethods(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(db.totpToken).toHaveBeenCalledWith(MOCK_ACCOUNT.uid);
    expect(Array.from(amr).sort()).toEqual(['email', 'pwd']);
  });

  it('returns [`pwd`,`email`,`otp`] for TOTP-enabled accounts', async () => {
    db.totpToken.mockResolvedValue({
      verified: true,
      enabled: true,
      sharedSecret: 'secret!',
    });
    const amr = await authMethods.availableAuthenticationMethods(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(db.totpToken).toHaveBeenCalledWith(MOCK_ACCOUNT.uid);
    expect(Array.from(amr).sort()).toEqual(['email', 'otp', 'pwd']);
  });

  it('returns [`pwd`,`email`] when TOTP token is not yet enabled', async () => {
    db.totpToken.mockResolvedValue({
      verified: true,
      enabled: false,
      sharedSecret: 'secret!',
    });
    const amr = await authMethods.availableAuthenticationMethods(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(db.totpToken).toHaveBeenCalledWith(MOCK_ACCOUNT.uid);
    expect(Array.from(amr).sort()).toEqual(['email', 'pwd']);
  });

  it('rethrows unexpected DB errors', async () => {
    db.totpToken.mockRejectedValue(error.serviceUnavailable());
    await expect(
      authMethods.availableAuthenticationMethods(db as any, MOCK_ACCOUNT as any)
    ).rejects.toMatchObject({ errno: error.ERRNO.SERVER_BUSY });
    expect(db.totpToken).toHaveBeenCalledWith(MOCK_ACCOUNT.uid);
  });
});

describe('verificationMethodToAMR', () => {
  it('maps `email` to `email`', () => {
    expect(authMethods.verificationMethodToAMR('email')).toBe('email');
  });

  it('maps `email-captcha` to `email`', () => {
    expect(authMethods.verificationMethodToAMR('email-captcha')).toBe('email');
  });

  it('maps `email-2fa` to `email`', () => {
    expect(authMethods.verificationMethodToAMR('email-2fa')).toBe('email');
  });

  it('maps `totp-2fa` to `otp`', () => {
    expect(authMethods.verificationMethodToAMR('totp-2fa')).toBe('otp');
  });

  it('maps `recovery-code` to `otp`', () => {
    expect(authMethods.verificationMethodToAMR('recovery-code')).toBe('otp');
  });

  it('maps `passkey` to `webauthn`', () => {
    expect(authMethods.verificationMethodToAMR('passkey')).toBe('webauthn');
  });

  it('throws when given an unknown verification method', () => {
    expect(() => {
      authMethods.verificationMethodToAMR('email-gotcha' as any);
    }).toThrow(/unknown verificationMethod/);
  });
});

describe('maximumAssuranceLevel', () => {
  it('returns 0 when no authentication methods are used', () => {
    expect(authMethods.maximumAssuranceLevel([])).toBe(0);
    expect(authMethods.maximumAssuranceLevel(new Set())).toBe(0);
  });

  it('returns 1 when only `pwd` auth is used', () => {
    expect(authMethods.maximumAssuranceLevel(['pwd'])).toBe(1);
  });

  it('returns 1 when only `email` auth is used', () => {
    expect(authMethods.maximumAssuranceLevel(['email'])).toBe(1);
  });

  it('returns 1 when only `otp` auth is used', () => {
    expect(authMethods.maximumAssuranceLevel(['otp'])).toBe(1);
  });

  it('returns 1 when only things-you-know auth mechanisms are used', () => {
    expect(authMethods.maximumAssuranceLevel(['email', 'pwd'])).toBe(1);
  });

  it('returns 2 when both `pwd` and `otp` methods are used', () => {
    expect(authMethods.maximumAssuranceLevel(['pwd', 'otp'])).toBe(2);
  });

  it('returns 2 when both `pwd` and `webauthn` methods are used (passkey session)', () => {
    expect(authMethods.maximumAssuranceLevel(['pwd', 'webauthn'])).toBe(2);
  });
});

describe('accountRequiresAAL2', () => {
  let db: { totpToken: jest.Mock };

  beforeEach(() => {
    db = { totpToken: jest.fn() };
  });

  it('returns false when account has no TOTP token', async () => {
    db.totpToken.mockRejectedValue(error.totpTokenNotFound());
    const result = await authMethods.accountRequiresAAL2(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(result).toBe(false);
  });

  // The current TOTP setup flow writes to the DB only at setup-complete via
  // replaceTotpToken, always with both flags true — partial states cannot be
  // produced by any current code path. These tests are defensive guards against
  // legacy data or future regressions.
  it('returns false when TOTP token exists but is not verified', async () => {
    db.totpToken.mockResolvedValue({ verified: false, enabled: true });
    const result = await authMethods.accountRequiresAAL2(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(result).toBe(false);
  });

  it('returns false when TOTP token exists but is not enabled', async () => {
    db.totpToken.mockResolvedValue({ verified: true, enabled: false });
    const result = await authMethods.accountRequiresAAL2(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(result).toBe(false);
  });

  it('returns true when TOTP token is both verified and enabled', async () => {
    db.totpToken.mockResolvedValue({ verified: true, enabled: true });
    const result = await authMethods.accountRequiresAAL2(
      db as any,
      MOCK_ACCOUNT as any
    );
    expect(result).toBe(true);
  });

  it('rethrows unexpected DB errors', async () => {
    db.totpToken.mockRejectedValue(error.serviceUnavailable());
    await expect(
      authMethods.accountRequiresAAL2(db as any, MOCK_ACCOUNT as any)
    ).rejects.toMatchObject({ errno: error.ERRNO.SERVER_BUSY });
  });
});
