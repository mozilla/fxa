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

// Extended account state (subset of unified data, for backwards compatibility)
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

// Full account state
export interface AccountState extends ExtendedAccountState {
  // Core identity
  uid: string | null;
  email: string | null;
  metricsEnabled: boolean;
  verified: boolean;
  // Derived field
  primaryEmail: Email | null;
  // Loading states
  isLoading: boolean;
  loadingFields: Set<string>;
  // Error state
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

export const AccountStateContext = createContext<AccountStateContextValue>({
  ...defaultAccountState,
  setAccountData: () => {},
  updateField: () => {},
  setLoading: () => {},
  setFieldLoading: () => {},
  setError: () => {},
  clearAccount: () => {},
});

export interface AccountStateProviderProps {
  children: ReactNode;
  initialState?: Partial<AccountState>;
}

/**
 * Convert unified localStorage data to AccountState format.
 * Handles the conversion of serialized fields (Error, Set) back to their runtime types.
 *
 * @param data - Raw data from localStorage (null if no account)
 * @param initialState - Optional initial state overrides (used for testing)
 */
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

  // Reconstruct Error from serialized {message, name} format
  // Note: Stack trace is lost during serialization, which is acceptable for UI errors
  const error = data.error
    ? Object.assign(new Error(data.error.message), { name: data.error.name })
    : null;

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
  // Listen for changes to accounts storage for reactivity
  const accountsData = useLocalStorageSync('accounts');
  const currentAccountUid = useLocalStorageSync('currentAccountUid') as string | undefined;

  // Derive account state from localStorage, recomputing when storage changes
  const accountState = useMemo<AccountState>(() => {
    // Reference accountsData to ensure useMemo recomputes when localStorage changes.
    // The useLocalStorageSync hook triggers updates on 'localStorageChange' events.
    void accountsData;

    const data = getAccountData(currentAccountUid);
    return unifiedToAccountState(data, initialState);
  }, [accountsData, currentAccountUid, initialState]);

  const setAccountDataCallback = useCallback((data: Partial<AccountState>) => {
    const uid = getCurrentAccountUid();
    if (!uid) return;

    // Prepare data for localStorage serialization:
    // - Convert Set to array (Set isn't JSON-serializable)
    // - Convert Error to {message, name} object
    // - Handle null -> undefined for uid/email (UnifiedAccountData uses undefined)
    // - Exclude derived field 'primaryEmail' (computed from emails array)
    const { uid: dataUid, email: dataEmail, primaryEmail, ...rest } = data;
    const storageData: Partial<UnifiedAccountData> = {
      ...rest,
      // Convert null to undefined for uid/email since UnifiedAccountData doesn't allow null
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
      if (!uid) return;

      // Skip derived field
      if (field === 'primaryEmail') {
        return;
      }

      // Handle special conversions
      let storageValue: any = value;
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

// Convenience hooks for common use cases
export function useAccountUid(): string | null {
  return useAccountState().uid;
}

export function useAccountEmail(): string | null {
  return useAccountState().email;
}

export function useAccountEmails(): Email[] {
  return useAccountState().emails;
}

export function usePrimaryEmail(): Email | null {
  return useAccountState().primaryEmail;
}

export function useAccountTotp(): AccountTotp | null {
  return useAccountState().totp;
}

export function useAccountRecoveryKey(): RecoveryKeyStatus | null {
  return useAccountState().recoveryKey;
}

export function useAccountRecoveryPhone(): RecoveryPhoneStatus | null {
  return useAccountState().recoveryPhone;
}

export function useAttachedClients(): AttachedClient[] {
  return useAccountState().attachedClients;
}

export function useAccountIsLoading(): boolean {
  return useAccountState().isLoading;
}

export function useAccountMetricsEnabled(): boolean {
  return useAccountState().metricsEnabled;
}

export function useAccountVerified(): boolean {
  return useAccountState().verified;
}
