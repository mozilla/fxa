/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  isPasswordlessEligible,
  isClientAllowedForPasswordless,
} from './passwordless';

describe('isPasswordlessEligible', () => {
  it('returns true for existing passwordless account even when featureEnabled=false', () => {
    const account = { verifierSetAt: 0 };
    expect(isPasswordlessEligible(account, 'test@example.com', false)).toBe(
      true
    );
  });

  it('returns true for existing passwordless account when featureEnabled=true', () => {
    const account = { verifierSetAt: 0 };
    expect(isPasswordlessEligible(account, 'test@example.com', true)).toBe(
      true
    );
  });

  it('returns false for existing password account when featureEnabled=false', () => {
    const account = { verifierSetAt: Date.now() };
    expect(isPasswordlessEligible(account, 'test@example.com', false)).toBe(
      false
    );
  });

  it('returns false for existing password account when featureEnabled=true', () => {
    const account = { verifierSetAt: Date.now() };
    expect(isPasswordlessEligible(account, 'test@example.com', true)).toBe(
      false
    );
  });

  it('returns false for new account (null) when featureEnabled=false', () => {
    expect(isPasswordlessEligible(null, 'test@example.com', false)).toBe(false);
  });

  it('returns true for new account (null) when featureEnabled=true', () => {
    expect(isPasswordlessEligible(null, 'test@example.com', true)).toBe(true);
  });

  it('returns false for third-party auth account (verifierSetAt=0 with linkedAccounts)', () => {
    const account = { verifierSetAt: 0, linkedAccounts: [{ providerId: 1 }] };
    expect(isPasswordlessEligible(account, 'test@example.com', false)).toBe(
      false
    );
  });

  it('returns false for third-party auth account even when featureEnabled=true', () => {
    const account = { verifierSetAt: 0, linkedAccounts: [{ providerId: 1 }] };
    expect(isPasswordlessEligible(account, 'test@example.com', true)).toBe(
      false
    );
  });

  it('returns true for passwordless account with empty linkedAccounts', () => {
    const account = { verifierSetAt: 0, linkedAccounts: [] };
    expect(isPasswordlessEligible(account, 'test@example.com', false)).toBe(
      true
    );
  });
});

describe('isClientAllowedForPasswordless', () => {
  it('returns true when clientId is in the allowed list', () => {
    expect(isClientAllowedForPasswordless(['abc123'], 'abc123')).toBe(true);
  });

  it('returns false when clientId is not in the allowed list', () => {
    expect(isClientAllowedForPasswordless(['abc123'], 'xyz789')).toBe(false);
  });

  it('returns false when no clientId is provided', () => {
    expect(isClientAllowedForPasswordless(['abc123'])).toBe(false);
  });

  it('returns false when allowedClientIds is empty', () => {
    expect(isClientAllowedForPasswordless([], 'abc123')).toBe(false);
  });
});
