/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  routeAfterResetOtp,
  routeAfterResetComplete,
  decideRecoveryChoice,
  RecoveryChoiceFacts,
} from './reset';

describe('routeAfterResetOtp', () => {
  it('routes to /confirm_totp_reset_password when totp is set and recoveryKeyExists is false', () => {
    expect(
      routeAfterResetOtp({ totpExists: true, recoveryKeyExists: false })
    ).toBe('/confirm_totp_reset_password');
  });

  it('routes to /account_recovery_confirm_key when recoveryKeyExists is true and totp is true', () => {
    expect(
      routeAfterResetOtp({ totpExists: true, recoveryKeyExists: true })
    ).toBe('/account_recovery_confirm_key');
  });

  it('routes to /account_recovery_confirm_key when recoveryKeyExists is true and totp is false', () => {
    expect(
      routeAfterResetOtp({ totpExists: false, recoveryKeyExists: true })
    ).toBe('/account_recovery_confirm_key');
  });

  it('routes to /complete_reset_password when neither totp nor recovery key is present', () => {
    expect(
      routeAfterResetOtp({ totpExists: false, recoveryKeyExists: false })
    ).toBe('/complete_reset_password');
  });

  it('routes to /complete_reset_password when totp is true but recoveryKeyExists is undefined (status check failed)', () => {
    // undefined !== false, so the TOTP branch must NOT fire
    expect(
      routeAfterResetOtp({ totpExists: true, recoveryKeyExists: undefined })
    ).toBe('/complete_reset_password');
  });

  it('routes to /complete_reset_password when both facts are undefined', () => {
    expect(routeAfterResetOtp({})).toBe('/complete_reset_password');
  });
});

describe('routeAfterResetComplete', () => {
  it('routes to /signin when sessionVerified is false and isOAuthWeb is false', () => {
    expect(
      routeAfterResetComplete({ sessionVerified: false, isOAuthWeb: false })
    ).toBe('/signin');
  });

  it('routes to /signin when sessionVerified is false and isOAuthWeb is true', () => {
    expect(
      routeAfterResetComplete({ sessionVerified: false, isOAuthWeb: true })
    ).toBe('/signin');
  });

  it('routes to /reset_password_verified when sessionVerified is true and isOAuthWeb is true', () => {
    expect(
      routeAfterResetComplete({ sessionVerified: true, isOAuthWeb: true })
    ).toBe('/reset_password_verified');
  });

  it('routes to /settings when sessionVerified is true and isOAuthWeb is false', () => {
    expect(
      routeAfterResetComplete({ sessionVerified: true, isOAuthWeb: false })
    ).toBe('/settings');
  });
});

describe('decideRecoveryChoice', () => {
  const base: RecoveryChoiceFacts = {
    hasToken: true,
    hasDataFetchError: false,
    loading: false,
    hasPhone: true,
    autoSendAttempted: false,
    numBackupCodes: 3,
  };

  it('returns redirect-reset when there is no token, even if a data error is also present', () => {
    // Priority 1 wins over Priority 2
    expect(
      decideRecoveryChoice({
        ...base,
        hasToken: false,
        hasDataFetchError: true,
      })
    ).toBe('redirect-reset');
  });

  it('returns redirect-reset when there is no token', () => {
    expect(decideRecoveryChoice({ ...base, hasToken: false })).toBe(
      'redirect-reset'
    );
  });

  it('returns handle-data-error when a data error is present and loading is also true', () => {
    // Priority 2 wins over Priority 3
    expect(
      decideRecoveryChoice({ ...base, hasDataFetchError: true, loading: true })
    ).toBe('handle-data-error');
  });

  it('returns handle-data-error when a data fetch error is present', () => {
    expect(decideRecoveryChoice({ ...base, hasDataFetchError: true })).toBe(
      'handle-data-error'
    );
  });

  it('returns wait when loading is true and no phone is available', () => {
    // Priority 3 wins over Priority 4
    expect(
      decideRecoveryChoice({ ...base, loading: true, hasPhone: false })
    ).toBe('wait');
  });

  it('returns wait when still loading', () => {
    expect(decideRecoveryChoice({ ...base, loading: true })).toBe('wait');
  });

  it('returns backup-codes when there is no phone even though auto-send has not been attempted', () => {
    // Priority 4 wins over Priority 5
    expect(
      decideRecoveryChoice({
        ...base,
        hasPhone: false,
        autoSendAttempted: false,
        numBackupCodes: 0,
      })
    ).toBe('backup-codes');
  });

  it('returns backup-codes when there is no phone', () => {
    expect(decideRecoveryChoice({ ...base, hasPhone: false })).toBe(
      'backup-codes'
    );
  });

  it('returns auto-send-phone when phone is present, auto-send not yet attempted, and no backup codes', () => {
    expect(
      decideRecoveryChoice({
        ...base,
        autoSendAttempted: false,
        numBackupCodes: 0,
      })
    ).toBe('auto-send-phone');
  });

  it('returns show-choice when auto-send was already attempted', () => {
    expect(
      decideRecoveryChoice({
        ...base,
        autoSendAttempted: true,
        numBackupCodes: 0,
      })
    ).toBe('show-choice');
  });

  it('returns show-choice when phone is present and backup codes exist', () => {
    expect(decideRecoveryChoice({ ...base })).toBe('show-choice');
  });
});
