/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  AccountStateProvider,
  useAccountState,
} from './AccountStateContext';
import * as storage from '../../lib/account-storage';

jest.mock('../../lib/account-storage');
jest.mock('../../lib/hooks/useLocalStorageSync', () => ({
  useLocalStorageSync: jest.fn(() => undefined),
}));

const UID = 'uid-123';
const EMAIL = 'test@example.com';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AccountStateProvider>{children}</AccountStateProvider>
);

function mockAccount(overrides: Record<string, any> = {}) {
  (storage.getAccountData as jest.Mock).mockReturnValue({
    uid: UID, email: EMAIL, verified: true, metricsEnabled: true,
    sessionVerified: false, displayName: null, avatar: null,
    accountCreated: null, passwordCreated: null, hasPassword: true,
    emails: [], totp: null, backupCodes: null, recoveryKey: null,
    recoveryPhone: null, attachedClients: [], linkedAccounts: [],
    subscriptions: [], securityEvents: [], isLoading: false,
    loadingFields: [], error: null,
    ...overrides,
  });
}

describe('AccountStateContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getAccountData as jest.Mock).mockReturnValue(null);
    (storage.getCurrentAccountUid as jest.Mock).mockReturnValue(UID);
  });

  it('throws outside provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAccountState())).toThrow(
      'useAccountState must be used within an AccountStateProvider'
    );
  });

  it('provides default state when no account data', () => {
    const { result } = renderHook(() => useAccountState(), { wrapper });
    expect(result.current.uid).toBeNull();
    expect(result.current.emails).toEqual([]);
    expect(result.current.metricsEnabled).toBe(true);
  });

  it('reads account data from storage and derives primaryEmail', () => {
    const primary = { email: EMAIL, isPrimary: true, verified: true };
    mockAccount({ displayName: 'Test', emails: [primary] });

    const { result } = renderHook(() => useAccountState(), { wrapper });
    expect(result.current.uid).toBe(UID);
    expect(result.current.displayName).toBe('Test');
    expect(result.current.primaryEmail).toEqual(primary);
  });

  it('setAccountData delegates to storage', () => {
    const { result } = renderHook(() => useAccountState(), { wrapper });
    act(() => result.current.setAccountData({ displayName: 'New' }));
    expect(storage.updateAccountData).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'New' }), UID
    );
  });

  it('clearAccount delegates to storage', () => {
    const { result } = renderHook(() => useAccountState(), { wrapper });
    act(() => result.current.clearAccount());
    expect(storage.clearExtendedAccountState).toHaveBeenCalledWith(UID);
  });

});
