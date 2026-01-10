/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Unified account storage module.
 * All account data is stored in a single `accounts[uid]` object in localStorage.
 * This replaces the previous split between `accounts` and `accountState_{uid}`.
 */

import Storage from './storage';
import { AccountAvatar, AccountTotp, AccountBackupCodes } from './interfaces';
import {
  Email,
  AttachedClient,
  LinkedAccount,
  SecurityEvent,
} from '../models/Account';

const storage = Storage.factory('localStorage');

/**
 * Unified account data interface - all account state in one place
 */
export interface UnifiedAccountData {
  // Core identity (shared with content-server)
  uid: string;
  email: string;
  sessionToken?: string;
  verified: boolean;
  metricsEnabled: boolean;
  sessionVerified: boolean;

  // Profile data
  displayName: string | null;
  avatar: (AccountAvatar & { isDefault?: boolean }) | null;
  profileImageId?: string;
  profileImageUrl?: string;
  profileImageUrlDefault?: boolean;

  // Account metadata
  accountCreated: number | null;
  passwordCreated: number | null;
  hasPassword: boolean;
  lastLogin?: number;
  alertText?: string;

  // Email addresses
  emails: Email[];

  // Security features
  totp: AccountTotp | null;
  backupCodes: AccountBackupCodes | null;
  recoveryKey: { exists: boolean; estimatedSyncDeviceCount?: number } | null;
  recoveryPhone: {
    exists: boolean;
    phoneNumber: string | null;
    nationalFormat?: string | null;
    available: boolean;
  } | null;

  // Connected services
  attachedClients: AttachedClient[];
  linkedAccounts: LinkedAccount[];
  subscriptions: { created: number; productName: string }[];
  securityEvents: SecurityEvent[];

  // UI state (transient)
  isLoading: boolean;
  loadingFields: string[];
  error: { message: string; name: string } | null;

  // Legacy content-server fields (preserved for compatibility)
  sessionTokenContext?: string;
  permissions?: Record<string, string[]>;
  grantedPermissions?: Record<string, string[]>;
  hadProfileImageSetBefore?: boolean;
  originalLoginEmail?: string;
  accountResetToken?: string;
  recoveryKeyId?: string;
  providerUid?: string;
}

// Keep ExtendedAccountState as an alias for backwards compatibility
export type ExtendedAccountState = Omit<
  UnifiedAccountData,
  'uid' | 'email' | 'sessionToken' | 'verified' | 'metricsEnabled' | 'sessionVerified' | 'lastLogin' | 'alertText' | 'sessionTokenContext' | 'permissions' | 'grantedPermissions' | 'hadProfileImageSetBefore' | 'originalLoginEmail' | 'accountResetToken' | 'recoveryKeyId' | 'providerUid' | 'profileImageId' | 'profileImageUrl' | 'profileImageUrlDefault'
>;

const defaultAccountData: Omit<UnifiedAccountData, 'uid' | 'email'> = {
  sessionToken: undefined,
  verified: false,
  metricsEnabled: true,
  sessionVerified: false,
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
  loadingFields: [],
  error: null,
};

/**
 * Legacy key for extended account state (used for migration)
 */
function getLegacyExtendedStateKey(uid: string): string {
  return `accountState_${uid}`;
}

/**
 * Dispatch storage change event for reactive updates
 */
function dispatchStorageEvent(): void {
  window.dispatchEvent(
    new CustomEvent('localStorageChange', { detail: { key: 'accounts' } })
  );
}

/**
 * Migrate legacy accountState_{uid} data into the unified accounts structure.
 * This is called automatically when reading account data.
 */
function migrateLegacyAccountState(uid: string): void {
  const legacyKey = getLegacyExtendedStateKey(uid);
  const legacyData = storage.get(legacyKey);

  if (!legacyData) {
    return; // No legacy data to migrate
  }

  const accounts = storage.get('accounts') || {};
  const currentAccount = accounts[uid];

  if (!currentAccount) {
    // Account doesn't exist in accounts, can't migrate
    storage.remove(legacyKey);
    return;
  }

  // Merge legacy data into the account (excluding transient UI state)
  const { isLoading, loadingFields, error, ...persistableLegacyData } =
    legacyData;

  accounts[uid] = {
    ...currentAccount,
    ...persistableLegacyData,
  };

  // Save merged data and remove legacy key
  storage.set('accounts', accounts);
  storage.remove(legacyKey);

  console.log(`Migrated legacy accountState for uid ${uid.substring(0, 8)}...`);
}

/**
 * Get the UID of the currently signed-in account from localStorage.
 * Returns null if no account is signed in.
 */
export function getCurrentAccountUid(): string | null {
  return storage.get('currentAccountUid') || null;
}

/**
 * Get account data from localStorage using the unified storage structure.
 * Automatically migrates legacy `accountState_{uid}` data if present.
 *
 * @param uid - Account UID (defaults to current signed-in account)
 * @returns Full account data with defaults for missing fields, or null if not found
 */
export function getAccountData(uid?: string): UnifiedAccountData | null {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return null;

  // Migrate legacy data if exists
  migrateLegacyAccountState(accountUid);

  const accounts = storage.get('accounts') || {};
  const account = accounts[accountUid];
  if (!account) return null;

  // Return with defaults for missing fields
  return {
    ...defaultAccountData,
    ...account,
    uid: account.uid,
    email: account.email || '',
    loadingFields: account.loadingFields || [],
    error: account.error || null,
  };
}

/**
 * Get basic account data (backwards compatible)
 */
export function getBasicAccountData(uid?: string): {
  uid: string;
  email: string;
  metricsEnabled: boolean;
  verified: boolean;
  sessionToken?: string;
  sessionVerified: boolean;
} | null {
  const account = getAccountData(uid);
  if (!account) return null;

  return {
    uid: account.uid,
    email: account.email,
    metricsEnabled: account.metricsEnabled,
    verified: account.verified,
    sessionToken: account.sessionToken,
    sessionVerified: account.sessionVerified,
  };
}

/**
 * Check if there's a signed-in account (has sessionToken and currentAccountUid)
 */
export function isSignedIn(): boolean {
  const account = getAccountData();
  return !!(account && account.sessionToken);
}

/**
 * Get session verified status for current account
 */
export function getSessionVerified(uid?: string): boolean {
  const account = getAccountData(uid);
  return account?.sessionVerified ?? false;
}

/**
 * Set session verified status for current account
 */
export function setSessionVerified(verified: boolean, uid?: string): void {
  updateAccountData({ sessionVerified: verified }, uid);
}

/**
 * Get extended account state (backwards compatible)
 */
export function getExtendedAccountState(uid?: string): ExtendedAccountState {
  const account = getAccountData(uid);
  if (!account) {
    return {
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
      loadingFields: [],
      error: null,
    };
  }

  return {
    displayName: account.displayName,
    avatar: account.avatar,
    accountCreated: account.accountCreated,
    passwordCreated: account.passwordCreated,
    hasPassword: account.hasPassword,
    emails: account.emails,
    totp: account.totp,
    backupCodes: account.backupCodes,
    recoveryKey: account.recoveryKey,
    recoveryPhone: account.recoveryPhone,
    attachedClients: account.attachedClients,
    linkedAccounts: account.linkedAccounts,
    subscriptions: account.subscriptions,
    securityEvents: account.securityEvents,
    isLoading: account.isLoading,
    loadingFields: account.loadingFields,
    error: account.error,
  };
}

/**
 * Transient UI state fields that should NOT be persisted to localStorage.
 * These are runtime-only values that don't need to survive page refreshes.
 */
const TRANSIENT_FIELDS = ['isLoading', 'loadingFields', 'error'] as const;

/**
 * Update account data in localStorage.
 * Transient UI state fields (isLoading, loadingFields, error) are filtered out
 * and not persisted to avoid stale state after page refresh.
 *
 * @param updates - Partial account data to merge
 * @param uid - Account UID (defaults to current signed-in account)
 */
export function updateAccountData(
  updates: Partial<UnifiedAccountData>,
  uid?: string
): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage.get('accounts') || {};
  const currentAccount = accounts[accountUid] || { uid: accountUid };

  // Filter out transient UI state from updates
  const persistableUpdates = { ...updates };
  for (const field of TRANSIENT_FIELDS) {
    delete persistableUpdates[field];
  }

  accounts[accountUid] = {
    ...currentAccount,
    ...persistableUpdates,
  };

  // Also remove any transient fields that may have been stored previously
  for (const field of TRANSIENT_FIELDS) {
    delete accounts[accountUid][field];
  }

  storage.set('accounts', accounts);
  dispatchStorageEvent();
}

/**
 * Update extended account state (backwards compatible)
 */
export function updateExtendedAccountState(
  updates: Partial<ExtendedAccountState>,
  uid?: string
): void {
  updateAccountData(updates as Partial<UnifiedAccountData>, uid);
}

/**
 * Update a single field in account data
 */
export function updateAccountField<K extends keyof UnifiedAccountData>(
  field: K,
  value: UnifiedAccountData[K],
  uid?: string
): void {
  updateAccountData({ [field]: value } as Partial<UnifiedAccountData>, uid);
}

/**
 * Update basic account data (backwards compatible)
 */
export function updateBasicAccountData(
  updates: Partial<{
    email: string;
    metricsEnabled: boolean;
    verified: boolean;
    displayName: string;
    sessionToken: string;
    sessionVerified: boolean;
  }>,
  uid?: string
): void {
  updateAccountData(updates, uid);
}

/**
 * Get full account data (backwards compatible)
 */
export function getFullAccountData(uid?: string): {
  uid: string | null;
  email: string | null;
  metricsEnabled: boolean;
  verified: boolean;
  displayName: string | null;
  avatar: (AccountAvatar & { isDefault?: boolean }) | null;
  accountCreated: number | null;
  passwordCreated: number | null;
  hasPassword: boolean;
  emails: Email[];
  primaryEmail: Email | null;
  totp: AccountTotp | null;
  backupCodes: AccountBackupCodes | null;
  recoveryKey: { exists: boolean; estimatedSyncDeviceCount?: number } | null;
  recoveryPhone: {
    exists: boolean;
    phoneNumber: string | null;
    nationalFormat?: string | null;
    available: boolean;
  } | null;
  attachedClients: AttachedClient[];
  linkedAccounts: LinkedAccount[];
  subscriptions: { created: number; productName: string }[];
  securityEvents: SecurityEvent[];
} | null {
  const account = getAccountData(uid);
  if (!account) return null;

  const emails = account.emails || [];

  return {
    uid: account.uid,
    email: account.email,
    metricsEnabled: account.metricsEnabled,
    verified: account.verified,
    displayName: account.displayName,
    avatar: account.avatar,
    accountCreated: account.accountCreated,
    passwordCreated: account.passwordCreated,
    hasPassword: account.hasPassword,
    emails,
    primaryEmail: emails.find((e) => e.isPrimary) || null,
    totp: account.totp,
    backupCodes: account.backupCodes,
    recoveryKey: account.recoveryKey,
    recoveryPhone: account.recoveryPhone,
    attachedClients: account.attachedClients,
    linkedAccounts: account.linkedAccounts,
    subscriptions: account.subscriptions,
    securityEvents: account.securityEvents,
  };
}

/**
 * Clear account extended data (resets to defaults, keeps basic identity)
 */
export function clearExtendedAccountState(uid?: string): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage.get('accounts') || {};
  const currentAccount = accounts[accountUid];
  if (!currentAccount) return;

  // Keep basic identity, reset extended data
  accounts[accountUid] = {
    uid: currentAccount.uid,
    email: currentAccount.email,
    sessionToken: currentAccount.sessionToken,
    verified: currentAccount.verified,
    metricsEnabled: currentAccount.metricsEnabled,
    sessionVerified: currentAccount.sessionVerified,
    lastLogin: currentAccount.lastLogin,
    // Reset extended data to defaults
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
    loadingFields: [],
    error: null,
  };

  storage.set('accounts', accounts);

  // Also remove any legacy key if it exists
  const legacyKey = getLegacyExtendedStateKey(accountUid);
  storage.remove(legacyKey);

  dispatchStorageEvent();
}

/**
 * Remove account completely from storage
 */
export function removeAccount(uid?: string): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage.get('accounts') || {};
  delete accounts[accountUid];
  storage.set('accounts', accounts);

  // Clear currentAccountUid if this was the current account
  if (getCurrentAccountUid() === accountUid) {
    storage.remove('currentAccountUid');
  }

  // Also remove any legacy key
  const legacyKey = getLegacyExtendedStateKey(accountUid);
  storage.remove(legacyKey);

  dispatchStorageEvent();
}

/**
 * Set the current account UID
 */
export function setCurrentAccountUid(uid: string): void {
  storage.set('currentAccountUid', uid);
  window.dispatchEvent(
    new CustomEvent('localStorageChange', { detail: { key: 'currentAccountUid' } })
  );
}
