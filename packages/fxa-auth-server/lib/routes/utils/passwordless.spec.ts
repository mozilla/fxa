/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';
import { parseConfigRules } from '@fxa/accounts/rate-limit';
import {
  isPasswordlessEligible,
  isClientAllowedForPasswordless,
  AllowedClientServices,
  PASSWORDLESS_SEND_OTP_SIGNUP,
  PASSWORDLESS_SEND_OTP_SIGNIN,
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

describe('passwordless rate limit actions', () => {
  // An action with no matching rule falls back to the report-only `default`
  // rule instead of erroring, so a typo in the action name would disable the
  // limit silently. These assertions are the only thing that catches that.
  const rules = parseConfigRules(
    fs.readFileSync(
      path.join(__dirname, '../../../config/rate-limit-rules.txt'),
      'utf8'
    )
  );

  it('resolves the signup action to at least one configured rule', () => {
    expect(rules[PASSWORDLESS_SEND_OTP_SIGNUP]?.length).toBeGreaterThan(0);
  });

  it('caps the signup action tighter than the shared action on every key it uses', () => {
    // A per-flow rule that is not strictly tighter than the shared rule never
    // receives the increment that would trip it, because the shared check runs
    // first. Equal values are dead config, and on windows longer than the block
    // duration they also stack blocks.
    const shared = rules['passwordlessSendOtp'];
    expect(shared?.length).toBeGreaterThan(0);

    for (const rule of rules[PASSWORDLESS_SEND_OTP_SIGNUP]) {
      const sharedPeer = shared.find(
        (s) =>
          s.blockingOn === rule.blockingOn &&
          s.windowDurationInSeconds === rule.windowDurationInSeconds
      );
      if (sharedPeer) {
        expect(rule.maxAttempts).toBeLessThan(sharedPeer.maxAttempts);
      }
    }
  });

  it('keeps every signin rule report-only, so signin enforcement is unchanged', () => {
    // The signin values match the shared rules. As `block` they would be dead
    // config at best, and would stack a second block on top of the shared one at
    // worst, because a tripped rule wipes only its own attempts counter.
    // `report` never blocks, so it is safe to carry them for the metrics.
    const signin = rules[PASSWORDLESS_SEND_OTP_SIGNIN];
    expect(signin?.length).toBeGreaterThan(0);
    for (const rule of signin) {
      expect(rule.blockPolicy).toBe('report');
    }
  });
});
