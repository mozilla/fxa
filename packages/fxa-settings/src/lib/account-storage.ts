/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Unified account storage - all data in `accounts[uid]` in localStorage. */

import { AccountAvatar, AccountTotp, AccountBackupCodes } from './interfaces';
import {
  Email,
  AttachedClient,
  LinkedAccount,
  SecurityEvent,
} from '../models/Account';
import { lazy } from './test-utils';
import Storage from './storage';

const storage = lazy<Storage>(() => Storage.factory('localStorage'));

export interface UnifiedAccountData {
  // Core identity
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

export type ExtendedAccountState = Pick<
  UnifiedAccountData,
  | 'displayName'
  | 'avatar'
  | 'accountCreated'
  | 'passwordCreated'
  | 'hasPassword'
  | 'emails'
  | 'totp'
  | 'backupCodes'
  | 'recoveryKey'
  | 'recoveryPhone'
  | 'attachedClients'
  | 'linkedAccounts'
  | 'subscriptions'
  | 'securityEvents'
  | 'isLoading'
  | 'loadingFields'
  | 'error'
>;

const defaultExtendedState: ExtendedAccountState = {
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

const defaultAccountData: Omit<UnifiedAccountData, 'uid' | 'email'> = {
  ...defaultExtendedState,
  sessionToken: undefined,
  verified: false,
  metricsEnabled: true,
  sessionVerified: false,
};

function getLegacyExtendedStateKey(uid: string): string {
  return `accountState_${uid}`;
}

function dispatchStorageEvent(): void {
  window.dispatchEvent(
    new CustomEvent('localStorageChange', { detail: { key: 'accounts' } })
  );
}

/** Migrate legacy accountState_{uid} data into unified accounts structure. */
function migrateLegacyAccountState(uid: string): void {
  const legacyKey = getLegacyExtendedStateKey(uid);
  const legacyData = storage().get(legacyKey);

  if (!legacyData) {
    return;
  }

  const accounts = storage().get('accounts') || {};
  const currentAccount = accounts[uid];

  if (!currentAccount) {
    storage().remove(legacyKey);
    return;
  }

  const { isLoading, loadingFields, error, ...persistableLegacyData } =
    legacyData;
  accounts[uid] = { ...currentAccount, ...persistableLegacyData };
  storage().set('accounts', accounts);
  storage().remove(legacyKey);
}

export function getCurrentAccountUid(): string | null {
  return storage().get('currentAccountUid') || null;
}

export function getAccountData(uid?: string): UnifiedAccountData | null {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return null;

  migrateLegacyAccountState(accountUid);

  const accounts = storage().get('accounts') || {};
  const account = accounts[accountUid];
  if (!account) return null;

  return {
    ...defaultAccountData,
    ...account,
    uid: account.uid,
    email: account.email || '',
    loadingFields: account.loadingFields || [],
    error: account.error || null,
  };
}

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

export function isSignedIn(): boolean {
  const account = getAccountData();
  return !!(account && account.sessionToken);
}

export function getSessionVerified(uid?: string): boolean {
  const account = getAccountData(uid);
  return account?.sessionVerified ?? false;
}

export function setSessionVerified(verified: boolean, uid?: string): void {
  updateAccountData({ sessionVerified: verified }, uid);
}

export function getExtendedAccountState(uid?: string): ExtendedAccountState {
  const account = getAccountData(uid);
  if (!account) {
    return { ...defaultExtendedState };
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

/** Update account data (transient UI state is filtered out). */
export function updateAccountData(
  updates: Partial<UnifiedAccountData>,
  uid?: string
): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage().get('accounts') || {};
  const currentAccount = accounts[accountUid] || { uid: accountUid };
  const { isLoading, loadingFields, error, ...persistableUpdates } = updates;
  const updatedAccount = {
    ...currentAccount,
    ...persistableUpdates,
  };
  delete updatedAccount.isLoading;
  delete updatedAccount.loadingFields;
  delete updatedAccount.error;

  accounts[accountUid] = updatedAccount;
  storage().set('accounts', accounts);
  dispatchStorageEvent();
}

export function updateExtendedAccountState(
  updates: Partial<ExtendedAccountState>,
  uid?: string
): void {
  updateAccountData(updates as Partial<UnifiedAccountData>, uid);
}

export function updateAccountField<K extends keyof UnifiedAccountData>(
  field: K,
  value: UnifiedAccountData[K],
  uid?: string
): void {
  updateAccountData({ [field]: value } as Partial<UnifiedAccountData>, uid);
}

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

/** Clear extended data (keeps basic identity). */
export function clearExtendedAccountState(uid?: string): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage().get('accounts') || {};
  const currentAccount = accounts[accountUid];
  if (!currentAccount) return;

  accounts[accountUid] = {
    uid: currentAccount.uid,
    email: currentAccount.email,
    sessionToken: currentAccount.sessionToken,
    verified: currentAccount.verified,
    metricsEnabled: currentAccount.metricsEnabled,
    sessionVerified: currentAccount.sessionVerified,
    lastLogin: currentAccount.lastLogin,
    ...defaultExtendedState,
  };

  storage().set('accounts', accounts);
  storage().remove(getLegacyExtendedStateKey(accountUid));
  dispatchStorageEvent();
}

export function removeAccount(uid?: string): void {
  const accountUid = uid || getCurrentAccountUid();
  if (!accountUid) return;

  const accounts = storage().get('accounts') || {};
  delete accounts[accountUid];
  storage().set('accounts', accounts);

  if (getCurrentAccountUid() === accountUid) {
    storage().remove('currentAccountUid');
  }
  storage().remove(getLegacyExtendedStateKey(accountUid));
  dispatchStorageEvent();
}

export function setCurrentAccountUid(uid: string): void {
  storage().set('currentAccountUid', uid);
  window.dispatchEvent(
    new CustomEvent('localStorageChange', {
      detail: { key: 'currentAccountUid' },
    })
  );
}
