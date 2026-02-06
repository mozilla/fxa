/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// jest.mock must precede imports because account-storage.ts calls
// Storage.factory() at module load time — the mock must be in place first.
// eslint-disable-next-line import/first
import {
  getAccountData,
  updateAccountData,
  getCurrentAccountUid,
  setCurrentAccountUid,
  removeAccount,
  clearExtendedAccountState,
  isSignedIn,
  getSessionVerified,
  setSessionVerified,
  getFullAccountData,
  UnifiedAccountData,
} from './account-storage';
import Storage from './storage';

jest.mock('./storage');

const UID = 'abc123';
const EMAIL = 'test@example.com';
const base = {
  uid: UID,
  email: EMAIL,
  verified: true,
  metricsEnabled: true,
  sessionVerified: true,
  sessionToken: 'tok',
};
const store = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};

function mockStore(
  accounts: Record<string, Partial<UnifiedAccountData>>,
  currentUid: string | null = UID
) {
  store.get.mockImplementation((key: string) => {
    if (key === 'currentAccountUid') return currentUid;
    if (key === 'accounts') return accounts;
    return null;
  });
}

/** Returns the account object from the most recent store.set('accounts', ...) call. */
function savedAccount() {
  const calls = store.set.mock.calls.filter((c: [string, unknown]) => c[0] === 'accounts');
  return calls[calls.length - 1][1][UID];
}

describe('account-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Storage.factory as jest.Mock).mockReturnValue(store);
  });

  it('getCurrentAccountUid reads from storage', () => {
    store.get.mockReturnValue(UID);
    expect(getCurrentAccountUid()).toBe(UID);
    store.get.mockReturnValue(null);
    expect(getCurrentAccountUid()).toBeNull();
  });

  it('setCurrentAccountUid writes and dispatches event', () => {
    const spy = jest.spyOn(window, 'dispatchEvent');
    setCurrentAccountUid(UID);
    expect(store.set).toHaveBeenCalledWith('currentAccountUid', UID);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'localStorageChange' })
    );
    spy.mockRestore();
  });

  describe('getAccountData', () => {
    it('returns null when no uid or no account', () => {
      store.get.mockReturnValue(null);
      expect(getAccountData()).toBeNull();

      mockStore({});
      expect(getAccountData()).toBeNull();
    });

    it('fills defaults for missing fields', () => {
      mockStore({ [UID]: base });
      const result = getAccountData(UID)!;
      expect(result.uid).toBe(UID);
      expect(result.emails).toEqual([]);
      expect(result.totp).toBeNull();
      expect(result.hasPassword).toBe(true);
    });

    it('migrates legacy accountState_{uid} data', () => {
      store.get.mockImplementation((key: string) => {
        if (key === `accountState_${UID}`) return { displayName: 'Migrated' };
        if (key === 'accounts') return { [UID]: base };
        return null;
      });
      getAccountData(UID);
      expect(savedAccount().displayName).toBe('Migrated');
      expect(store.remove).toHaveBeenCalledWith(`accountState_${UID}`);
    });
  });

  describe('updateAccountData', () => {
    it('merges updates and filters transient fields', () => {
      mockStore({ [UID]: base });
      updateAccountData({
        displayName: 'X',
        isLoading: true,
        loadingFields: ['a'],
        error: { message: 'e', name: 'E' },
      } as Partial<UnifiedAccountData>);
      const saved = savedAccount();
      expect(saved.displayName).toBe('X');
      expect(saved.isLoading).toBeUndefined();
      expect(saved.loadingFields).toBeUndefined();
      expect(saved.error).toBeUndefined();
    });

    it('dispatches localStorageChange event', () => {
      const spy = jest.spyOn(window, 'dispatchEvent');
      mockStore({ [UID]: base });
      updateAccountData({ displayName: 'Y' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'localStorageChange' })
      );
      spy.mockRestore();
    });
  });

  it('removeAccount deletes account and clears currentAccountUid', () => {
    mockStore({ [UID]: base });
    removeAccount(UID);
    expect(store.set).toHaveBeenCalledWith('accounts', {});
    expect(store.remove).toHaveBeenCalledWith('currentAccountUid');
  });

  it('clearExtendedAccountState resets extended data, keeps identity', () => {
    mockStore({
      [UID]: { ...base, displayName: 'Old', totp: { exists: true, verified: true } },
    });
    clearExtendedAccountState(UID);
    const saved = savedAccount();
    expect(saved.uid).toBe(UID);
    expect(saved.sessionToken).toBe('tok');
    expect(saved.displayName).toBeNull();
    expect(saved.totp).toBeNull();
  });

  it('isSignedIn checks sessionToken presence', () => {
    mockStore({ [UID]: base });
    expect(isSignedIn()).toBe(true);
    store.get.mockReturnValue(null);
    expect(isSignedIn()).toBe(false);
  });

  it('getSessionVerified / setSessionVerified read and write', () => {
    mockStore({ [UID]: { ...base, sessionVerified: true } });
    expect(getSessionVerified(UID)).toBe(true);

    mockStore({ [UID]: base });
    setSessionVerified(false);
    expect(savedAccount().sessionVerified).toBe(false);
  });

  it('getFullAccountData derives primaryEmail', () => {
    const emails = [{ email: EMAIL, isPrimary: true, verified: true }];
    mockStore({ [UID]: { ...base, emails } });
    expect(getFullAccountData(UID)!.primaryEmail).toEqual(emails[0]);

    store.get.mockReturnValue(null);
    expect(getFullAccountData()).toBeNull();
  });
});
