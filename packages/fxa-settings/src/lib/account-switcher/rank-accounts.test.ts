/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { rankAccounts } from './rank-accounts';
import { UnifiedAccountData } from '../account-storage';

const account = (
  overrides: Partial<UnifiedAccountData> & { email: string }
): Partial<UnifiedAccountData> => ({
  sessionToken: 'token',
  lastLogin: 1000,
  ...overrides,
});

const emails = (accounts: { email: string }[]) => accounts.map((a) => a.email);

describe('rankAccounts', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(rankAccounts({ accounts: {} })).toEqual([]);
  });

  it('orders by most recent login when no tier applies', () => {
    const ranked = rankAccounts({
      accounts: {
        a: account({ email: 'older@example.com', lastLogin: 100 }),
        b: account({ email: 'newer@example.com', lastLogin: 300 }),
        c: account({ email: 'middle@example.com', lastLogin: 200 }),
      },
    });

    expect(emails(ranked)).toEqual([
      'newer@example.com',
      'middle@example.com',
      'older@example.com',
    ]);
  });

  it('treats a missing lastLogin as least recent', () => {
    const ranked = rankAccounts({
      accounts: {
        a: account({ email: 'unknown@example.com', lastLogin: undefined }),
        b: account({ email: 'known@example.com', lastLogin: 1 }),
      },
    });

    expect(emails(ranked)).toEqual([
      'known@example.com',
      'unknown@example.com',
    ]);
  });

  describe('tier precedence', () => {
    const accounts = {
      requested: account({ email: 'requested@example.com', lastLogin: 1 }),
      firefox: account({ email: 'firefox@example.com', lastLogin: 2 }),
      current: account({ email: 'current@example.com', lastLogin: 3 }),
      other: account({ email: 'other@example.com', lastLogin: 4 }),
    };

    it('puts the requested email first when it is the current account', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'requested@example.com',
        firefoxSignedInUid: 'firefox',
        currentAccountUid: 'requested',
      });

      expect(emails(ranked)).toEqual([
        'requested@example.com',
        'firefox@example.com',
        'other@example.com',
        'current@example.com',
      ]);
    });

    it('puts the requested email first when it is the browser account', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'firefox@example.com',
        firefoxSignedInUid: 'firefox',
        currentAccountUid: 'current',
      });

      expect(ranked[0].email).toEqual('firefox@example.com');
    });

    it('does not promote a requested email that is neither current nor the browser account', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'requested@example.com',
        firefoxSignedInUid: 'firefox',
        currentAccountUid: 'current',
      });

      expect(emails(ranked)).toEqual([
        'firefox@example.com',
        'current@example.com',
        'other@example.com',
        'requested@example.com',
      ]);
    });

    it('puts the Firefox account ahead of the current account', () => {
      const ranked = rankAccounts({
        accounts,
        firefoxSignedInUid: 'firefox',
        currentAccountUid: 'current',
      });

      expect(emails(ranked)).toEqual([
        'firefox@example.com',
        'current@example.com',
        'other@example.com',
        'requested@example.com',
      ]);
    });

    it('falls back to the current account when the browser is not signed in', () => {
      const ranked = rankAccounts({ accounts, currentAccountUid: 'current' });

      expect(ranked[0].email).toEqual('current@example.com');
    });

    it('does not promote an unmatched requested email', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'nobody@example.com',
        currentAccountUid: 'current',
      });

      expect(ranked[0].email).toEqual('current@example.com');
    });

    it('matches the requested email case- and whitespace-insensitively', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: '  REQUESTED@Example.com ',
        currentAccountUid: 'requested',
      });

      expect(ranked[0].email).toEqual('requested@example.com');
    });

    it('keeps one account in its highest tier when tiers overlap', () => {
      const ranked = rankAccounts({
        accounts: { solo: account({ email: 'solo@example.com' }) },
        requestedEmail: 'solo@example.com',
        firefoxSignedInUid: 'solo',
        currentAccountUid: 'solo',
      });

      expect(ranked).toHaveLength(1);
      expect(ranked[0]).toMatchObject({
        isCurrent: true,
        isFirefoxSignedIn: true,
      });
    });
  });

  describe('last used for the requesting client', () => {
    const accounts = {
      firefox: account({ email: 'firefox@example.com', lastLogin: 3 }),
      sumo: account({ email: 'sumo@example.com', lastLogin: 1 }),
      monitor: account({ email: 'monitor@example.com', lastLogin: 2 }),
    };

    it('puts the last-used account ahead of the browser account', () => {
      const ranked = rankAccounts({
        accounts,
        firefoxSignedInUid: 'firefox',
        lastUsedForClientUid: 'sumo',
      });

      expect(emails(ranked)).toEqual([
        'sumo@example.com',
        'firefox@example.com',
        'monitor@example.com',
      ]);
      expect(ranked[0].isLastUsedForClient).toBe(true);
    });

    it('promotes a requested email that matches the last-used account', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'sumo@example.com',
        firefoxSignedInUid: 'firefox',
        lastUsedForClientUid: 'sumo',
      });

      expect(ranked[0].email).toBe('sumo@example.com');
    });

    it('lets a requested browser account outrank the last-used account', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'firefox@example.com',
        firefoxSignedInUid: 'firefox',
        lastUsedForClientUid: 'sumo',
      });

      expect(emails(ranked)).toEqual([
        'firefox@example.com',
        'sumo@example.com',
        'monitor@example.com',
      ]);
    });

    it('still ignores a requested email with no history for the client', () => {
      const ranked = rankAccounts({
        accounts,
        requestedEmail: 'monitor@example.com',
        firefoxSignedInUid: 'firefox',
        lastUsedForClientUid: 'sumo',
      });

      expect(ranked[0].email).toBe('sumo@example.com');
    });

    it('ignores a last-used uid that is no longer stored', () => {
      const ranked = rankAccounts({
        accounts,
        firefoxSignedInUid: 'firefox',
        lastUsedForClientUid: 'removed',
      });

      expect(ranked[0].email).toBe('firefox@example.com');
      expect(ranked.some((a) => a.isLastUsedForClient)).toBe(false);
    });
  });

  describe('accounts needing re-authentication', () => {
    it('sorts a session-less account below one with a session', () => {
      const ranked = rankAccounts({
        accounts: {
          stale: account({
            email: 'stale@example.com',
            sessionToken: undefined,
            lastLogin: 999,
          }),
          live: account({ email: 'live@example.com', lastLogin: 1 }),
        },
      });

      expect(emails(ranked)).toEqual(['live@example.com', 'stale@example.com']);
    });

    it('still puts a session-less requested account first', () => {
      const ranked = rankAccounts({
        accounts: {
          stale: account({
            email: 'stale@example.com',
            sessionToken: undefined,
          }),
          live: account({ email: 'live@example.com' }),
        },
        requestedEmail: 'stale@example.com',
        currentAccountUid: 'stale',
      });

      expect(ranked[0].email).toEqual('stale@example.com');
    });

    it('still puts a session-less browser account above the rest', () => {
      const ranked = rankAccounts({
        accounts: {
          browser: account({
            email: 'browser@example.com',
            sessionToken: undefined,
          }),
          live: account({ email: 'live@example.com' }),
        },
        firefoxSignedInUid: 'browser',
      });

      expect(ranked[0].email).toEqual('browser@example.com');
    });
  });

  describe('invalid rows', () => {
    it('drops accounts with no email', () => {
      const ranked = rankAccounts({
        accounts: {
          valid: account({ email: 'valid@example.com' }),
          missing: { sessionToken: 'token' },
          empty: { email: '' },
        },
      });

      expect(emails(ranked)).toEqual(['valid@example.com']);
    });

    it('drops an account stored under an empty uid', () => {
      const ranked = rankAccounts({
        accounts: { '': account({ email: 'orphan@example.com' }) },
      });

      expect(ranked).toEqual([]);
    });
  });

  describe('derived fields', () => {
    it('flags accounts without a session token', () => {
      const ranked = rankAccounts({
        accounts: {
          withToken: account({ email: 'with@example.com' }),
          without: { email: 'without@example.com', sessionToken: undefined },
        },
      });

      const byEmail = Object.fromEntries(ranked.map((a) => [a.email, a]));
      expect(byEmail['with@example.com'].hasSession).toBe(true);
      expect(byEmail['without@example.com'].hasSession).toBe(false);
    });

    it('carries the uid, display name and avatar through', () => {
      const avatar = { id: 'abc', url: 'https://example.com/a.png' };
      const [ranked] = rankAccounts({
        accounts: {
          uid1: account({
            email: 'user@example.com',
            displayName: 'Test User',
            avatar,
          }),
        },
      });

      expect(ranked).toMatchObject({
        uid: 'uid1',
        email: 'user@example.com',
        displayName: 'Test User',
        avatar,
      });
    });

    it('defaults a missing display name and avatar to null', () => {
      const [ranked] = rankAccounts({
        accounts: { uid1: account({ email: 'user@example.com' }) },
      });

      expect(ranked.displayName).toBeNull();
      expect(ranked.avatar).toBeNull();
    });

    it('does not flag a Firefox account when the browser reports none', () => {
      const [ranked] = rankAccounts({
        accounts: { uid1: account({ email: 'user@example.com' }) },
        firefoxSignedInUid: null,
      });

      expect(ranked.isFirefoxSignedIn).toBe(false);
    });
  });

  it('does not mutate the accounts it was given', () => {
    const accounts = {
      a: account({ email: 'a@example.com', lastLogin: 1 }),
      b: account({ email: 'b@example.com', lastLogin: 2 }),
    };
    const snapshot = JSON.stringify(accounts);

    rankAccounts({ accounts, currentAccountUid: 'a' });

    expect(JSON.stringify(accounts)).toEqual(snapshot);
  });
});
