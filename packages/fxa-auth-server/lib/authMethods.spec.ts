/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { AppError as error } from '@fxa/accounts/errors';
import * as authMethods from './authMethods';

const MOCK_ACCOUNT = {
  uid: 'abcdef123456',
};

function mockDB() {
  return {
    totpToken: sinon.stub(),
    // Add other DB methods as needed
  };
}

describe('availableAuthenticationMethods', () => {
  let mockDbInstance: ReturnType<typeof mockDB>;

  beforeEach(() => {
    mockDbInstance = mockDB();
  });

  it('returns [`pwd`,`email`] for non-TOTP-enabled accounts', async () => {
    mockDbInstance.totpToken = sinon.stub().rejects(error.totpTokenNotFound());
    const amr = await authMethods.availableAuthenticationMethods(
      mockDbInstance as any,
      MOCK_ACCOUNT as any
    );
    expect(mockDbInstance.totpToken.calledWithExactly(MOCK_ACCOUNT.uid)).toBe(true);
    expect(Array.from(amr).sort()).toEqual(['email', 'pwd']);
  });

  it('returns [`pwd`,`email`,`otp`] for TOTP-enabled accounts', async () => {
    mockDbInstance.totpToken = sinon.stub().resolves({
      verified: true,
      enabled: true,
      sharedSecret: 'secret!',
    });
    const amr = await authMethods.availableAuthenticationMethods(
      mockDbInstance as any,
      MOCK_ACCOUNT as any
    );
    expect(mockDbInstance.totpToken.calledWithExactly(MOCK_ACCOUNT.uid)).toBe(true);
    expect(Array.from(amr).sort()).toEqual(['email', 'otp', 'pwd']);
  });

  it('returns [`pwd`,`email`] when TOTP token is not yet enabled', async () => {
    mockDbInstance.totpToken = sinon.stub().resolves({
      verified: true,
      enabled: false,
      sharedSecret: 'secret!',
    });
    const amr = await authMethods.availableAuthenticationMethods(
      mockDbInstance as any,
      MOCK_ACCOUNT as any
    );
    expect(mockDbInstance.totpToken.calledWithExactly(MOCK_ACCOUNT.uid)).toBe(true);
    expect(Array.from(amr).sort()).toEqual(['email', 'pwd']);
  });

  it('rethrows unexpected DB errors', async () => {
    mockDbInstance.totpToken = sinon.stub().rejects(error.serviceUnavailable());
    try {
      await authMethods.availableAuthenticationMethods(
        mockDbInstance as any,
        MOCK_ACCOUNT as any
      );
      throw new Error('error should have been re-thrown');
    } catch (err: any) {
      expect(mockDbInstance.totpToken.calledWithExactly(MOCK_ACCOUNT.uid)).toBe(true);
      expect(err.errno).toBe(error.ERRNO.SERVER_BUSY);
    }
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
});
