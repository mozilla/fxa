/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  AccountAvatar,
  AccountTotp,
  AccountBackupCodes,
} from '../../lib/interfaces';
import {
  Email,
  AttachedClient,
  LinkedAccount,
  SecurityEvent,
} from '../Account';
import { useLocalStorageSync } from '../../lib/hooks/useLocalStorageSync';
import {
  getAccountData,
  updateAccountData,
  clearExtendedAccountState,
  getCurrentAccountUid,
  UnifiedAccountData,
} from '../../lib/account-storage';

export interface RecoveryKeyStatus {
  exists: boolean;
  estimatedSyncDeviceCount?: number;
}

export interface RecoveryPhoneStatus {
  exists: boolean;
  phoneNumber: string | null;
  nationalFormat?: string | null;
  available: boolean;
}

export interface Subscription {
  created: number;
  productName: string;
}

export interface ExtendedAccountState {
  displayName: string | null;
  avatar: (AccountAvatar & { isDefault?: boolean }) | null;
  accountCreated: number | null;
  passwordCreated: number | null;
  hasPassword: boolean;
  emails: Email[];
  totp: AccountTotp | null;
  backupCodes: AccountBackupCodes | null;
  recoveryKey: RecoveryKeyStatus | null;
  recoveryPhone: RecoveryPhoneStatus | null;
  attachedClients: AttachedClient[];
  linkedAccounts: LinkedAccount[];
  subscriptions: Subscription[];
  securityEvents: SecurityEvent[];
}

export interface AccountState extends ExtendedAccountState {
  uid: string | null;
  email: string | null;
  metricsEnabled: boolean;
  verified: boolean;
  primaryEmail: Email | null;
  isLoading: boolean;
  loadingFields: Set<string>;
  error: Error | null;
}

export interface AccountStateActions {
  setAccountData: (data: Partial<AccountState>) => void;
  updateField: <K extends keyof AccountState>(
    field: K,
    value: AccountState[K]
  ) => void;
  setLoading: (loading: boolean) => void;
  setFieldLoading: (field: string, loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearAccount: () => void;
}

export type AccountStateContextValue = AccountState & AccountStateActions;

const defaultAccountState: AccountState = {
  uid: null,
  email: null,
  metricsEnabled: true,
  verified: false,
  primaryEmail: null,
  displayName: null,
  avatar: null,
  accountCreated: null,
  passwordCreated: null,
  hasPassword: true,
  emails: [],
  totp: null,
  backupCodes: null,
  recoveryKey: null,
  recoveryPhone: null,
  attachedClients: [],
  linkedAccounts: [],
  subscriptions: [],
  securityEvents: [],
  isLoading: false,
  loadingFields: new Set(),
  error: null,
};

export const AccountStateContext =
  createContext<AccountStateContextValue | null>(null);

export interface AccountStateProviderProps {
  children: ReactNode;
  initialState?: Partial<AccountState>;
}

/** Convert localStorage data to AccountState (deserializes Error and Set). */
function unifiedToAccountState(
  data: UnifiedAccountData | null,
  initialState?: Partial<AccountState>
): AccountState {
  if (!data) {
    return {
      ...defaultAccountState,
      ...(initialState || {}),
    };
  }

  const emails = data.emails || [];
  const loadingFields = new Set(data.loadingFields || []);
  let error: Error | null = null;
  if (data.error) {
    error = new Error(data.error.message);
    error.name = data.error.name;
  }

  return {
    uid: data.uid,
    email: data.email,
    metricsEnabled: data.metricsEnabled,
    verified: data.verified,
    displayName: data.displayName,
    avatar: data.avatar,
    accountCreated: data.accountCreated,
    passwordCreated: data.passwordCreated,
    hasPassword: data.hasPassword,
    emails,
    primaryEmail: emails.find((e) => e.isPrimary) || null,
    totp: data.totp,
    backupCodes: data.backupCodes,
    recoveryKey: data.recoveryKey,
    recoveryPhone: data.recoveryPhone,
    attachedClients: data.attachedClients,
    linkedAccounts: data.linkedAccounts,
    subscriptions: data.subscriptions,
    securityEvents: data.securityEvents,
    isLoading: data.isLoading,
    loadingFields,
    error,
    ...(initialState || {}),
  };
}

export function AccountStateProvider({
  children,
  initialState,
}: AccountStateProviderProps) {
  // useLocalStorageSync triggers re-renders on storage changes;
  // we read from getAccountData() rather than the return value directly
  useLocalStorageSync('accounts');
  const currentAccountUid = useLocalStorageSync('currentAccountUid') as string | undefined;

  const accountState = unifiedToAccountState(
    getAccountData(currentAccountUid),
    initialState
  );

  // Serialize AccountState -> UnifiedAccountData for localStorage:
  // Set -> Array, Error -> {message,name}, exclude derived 'primaryEmail'
  const setAccountDataCallback = useCallback((data: Partial<AccountState>) => {
    const uid = getCurrentAccountUid();
    if (!uid) return;

    const { uid: dataUid, email: dataEmail, primaryEmail, ...rest } = data;
    const storageData: Partial<UnifiedAccountData> = {
      ...rest,
      ...(dataUid !== undefined && { uid: dataUid ?? undefined }),
      ...(dataEmail !== undefined && { email: dataEmail ?? undefined }),
      loadingFields: data.loadingFields ? Array.from(data.loadingFields) : undefined,
      error: data.error ? { message: data.error.message, name: data.error.name } : undefined,
    };
    updateAccountData(storageData, uid);
  }, []);

  const updateField = useCallback(
    <K extends keyof AccountState>(field: K, value: AccountState[K]) => {
      const uid = getCurrentAccountUid();
      if (!uid || field === 'primaryEmail') return;

      let storageValue: UnifiedAccountData[keyof UnifiedAccountData] = value as UnifiedAccountData[keyof UnifiedAccountData];
      if (field === 'loadingFields' && value instanceof Set) {
        storageValue = Array.from(value);
      }
      if (field === 'error' && value instanceof Error) {
        storageValue = { message: value.message, name: value.name };
      }
      updateAccountData({ [field]: storageValue } as Partial<UnifiedAccountData>, uid);
    },
    []
  );

  const setLoading = useCallback((loading: boolean) => {
    const uid = getCurrentAccountUid();
    if (!uid) return;
    updateAccountData({ isLoading: loading }, uid);
  }, []);

  const setFieldLoading = useCallback((field: string, loading: boolean) => {
    const uid = getCurrentAccountUid();
    if (!uid) return;

    const currentData = getAccountData(uid);
    const currentLoadingFields = new Set(currentData?.loadingFields || []);

    if (loading) {
      currentLoadingFields.add(field);
    } else {
      currentLoadingFields.delete(field);
    }

    updateAccountData({ loadingFields: Array.from(currentLoadingFields) }, uid);
  }, []);

  const setError = useCallback((error: Error | null) => {
    const uid = getCurrentAccountUid();
    if (!uid) return;
    updateAccountData({
      error: error ? { message: error.message, name: error.name } : null,
    }, uid);
  }, []);

  const clearAccount = useCallback(() => {
    const uid = getCurrentAccountUid();
    if (!uid) return;
    clearExtendedAccountState(uid);
  }, []);

  // Memoize context value to prevent all consumers from re-rendering on every provider render
  const value = useMemo<AccountStateContextValue>(
    () => ({
      ...accountState,
      setAccountData: setAccountDataCallback,
      updateField,
      setLoading,
      setFieldLoading,
      setError,
      clearAccount,
    }),
    [
      accountState,
      setAccountDataCallback,
      updateField,
      setLoading,
      setFieldLoading,
      setError,
      clearAccount,
    ]
  );

  return (
    <AccountStateContext.Provider value={value}>
      {children}
    </AccountStateContext.Provider>
  );
}

export function useAccountState(): AccountStateContextValue {
  const context = useContext(AccountStateContext);
  if (!context) {
    throw new Error(
      'useAccountState must be used within an AccountStateProvider'
    );
  }
  return context;
}
