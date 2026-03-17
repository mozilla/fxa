/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  isPasswordlessEligible,
  isClientAllowedForPasswordless,
  AllowedClientServices,
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
  const allowedClientServices: AllowedClientServices = {
    abc123: { allowedServices: ['sync', 'profile'] },
    xyz789: { allowedServices: ['*'] },
    empty123: { allowedServices: [] },
  };

  describe('with valid clientId and service combinations', () => {
    it('returns true when clientId and service are both allowed', () => {
      expect(
        isClientAllowedForPasswordless(allowedClientServices, 'abc123', 'sync')
      ).toBe(true);
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'abc123',
          'profile'
        )
      ).toBe(true);
    });

    it('returns false when clientId is allowed but service is not', () => {
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'abc123',
          'monitor'
        )
      ).toBe(false);
    });

    it('returns false when clientId is in config but no service specified and no wildcard', () => {
      expect(isClientAllowedForPasswordless(allowedClientServices, 'abc123')).toBe(
        false
      );
    });
  });

  describe('with wildcard support', () => {
    it('returns true when allowedServices includes wildcard', () => {
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'xyz789',
          'any-service'
        )
      ).toBe(true);
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'xyz789',
          'another-service'
        )
      ).toBe(true);
    });

    it('returns true when allowedServices includes wildcard and no service specified', () => {
      expect(
        isClientAllowedForPasswordless(allowedClientServices, 'xyz789')
      ).toBe(true);
    });
  });

  describe('with empty allowedServices', () => {
    it('returns false when allowedServices is empty array', () => {
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'empty123',
          'sync'
        )
      ).toBe(false);
    });

    it('returns false when allowedServices is empty and no service specified', () => {
      expect(
        isClientAllowedForPasswordless(allowedClientServices, 'empty123')
      ).toBe(false);
    });
  });

  describe('with invalid inputs', () => {
    it('returns false when clientId is not in the config', () => {
      expect(
        isClientAllowedForPasswordless(
          allowedClientServices,
          'unknown',
          'sync'
        )
      ).toBe(false);
    });

    it('returns false when no clientId is provided', () => {
      expect(
        isClientAllowedForPasswordless(allowedClientServices, undefined, 'sync')
      ).toBe(false);
    });

    it('returns false when allowedClientServices is empty', () => {
      expect(isClientAllowedForPasswordless({}, 'abc123', 'sync')).toBe(false);
    });

    it('returns false when allowedClientServices is undefined', () => {
      expect(
        isClientAllowedForPasswordless(undefined as any, 'abc123', 'sync')
      ).toBe(false);
    });
  });
});