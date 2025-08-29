/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { storage } from '../storage';
import { searchParam } from '../utilities';
import { InvalidCachedAccountState } from './errors';
import { StoredAccountData } from '../types';

const STORAGE_KEY__ACCOUNTS = 'accounts';
const STORAGE_KEY__CURRENT_ACCOUNT_UID = 'currentAccountUid';

/**
 * Sets account in local storage. If the account exists it is overridden. Accounts are keyed on UID.
 */
export function setAccount(account: StoredAccountData) {
  // Fail fast if account isn't in a valid state.
  if (!isValidAccount(account)) {
    Sentry.captureMessage('Invalid stored account state detected!');
    throw new InvalidCachedAccountState();
  }

  const accounts = getAccounts();
  accounts[account.uid] = account;
  setAccounts(accounts);
}

/**
 * Removes account from local storage by uid
 * @param account
 */
export function removeAccount(account: { uid: string }) {
  const accounts = getAccounts();
  if (accounts[account.uid]) {
    delete accounts[account.uid];
  }
  setAccounts(accounts);
}

/**
 * Locates account by account uid
 * @param uid
 * @returns
 */
export function findAccountByUid(uid: string): StoredAccountData | null {
  const account = getAccounts()[uid] || null;

  if (account && uid !== account.uid) {
    Sentry.captureMessage('Account uid mismatch!');
  }

  return account;
}

/**
 * Locates account by email
 * @param email
 * @returns
 */
export function findAccountByEmail(email: string): StoredAccountData | null {
  const account =
    Object.values(getAccounts()).find((x) => x.email && x.email === email) ||
    null;
  return account;
}

/**
 * Retrieves the last stored account.
 * @returns
 */
export function findLastStoredAccount() {
  const all = getAccounts();

  let latestAccount: StoredAccountData | undefined = undefined;
  for (const key in all) {
    const account = all[key];
    if (
      account?.lastLogin != null &&
      (latestAccount?.lastLogin == null ||
        latestAccount.lastLogin < account.lastLogin)
    ) {
      latestAccount = account;
    }
  }

  // I think we should run this on every access...
  // if (latestAccount) {
  //   validateAccount(latestAccount);
  // }

  return latestAccount;
}

/**
 * Gets accounts from storage
 * @returns
 */
function getAccounts(): Record<string, StoredAccountData> {
  return storage.local.get(STORAGE_KEY__ACCOUNTS) || {};
}

/**
 * Sets accounts in storage
 * @param accounts
 * @returns
 */
function setAccounts(accounts: Record<string, StoredAccountData>) {
  return storage.local.set(STORAGE_KEY__ACCOUNTS, accounts);
}

/**
 * Sets the current account uid. ie The active account's uid.
 * @param uid
 */
export function setCurrentAccount(account: StoredAccountData) {
  // Note, we used to execute the logic held in forceCUrrentAccountFromUidQueryParams,
  // which might have been a foot gun. Let's try calling that explicitly from here on
  // out, and not make it magic.
  setAccount(account);
  storage.local.set(STORAGE_KEY__CURRENT_ACCOUNT_UID, account.uid);
}

/**
 * Returns the current (ie active) account uid.
 * @returns
 */
export function getCurrentAccount(): StoredAccountData | null {
  const uid = storage.local.get(STORAGE_KEY__CURRENT_ACCOUNT_UID);
  if (uid) {
    return findAccountByUid(uid);
  }
  return null;
}

/**
 * Removes the current account uid thereby putting the cache into state where there is no current account.
 * @returns
 */
export function unsetCurrentAccount(): void {
  return storage.local.remove(STORAGE_KEY__CURRENT_ACCOUNT_UID);
}

/**
 * Uses the search query parameter uid value to set the 'current' account.
 * @returns
 */
export function forceCurrentAccountFromUidQueryParams() {
  const forceUid = searchParam('uid', window.location.search);
  if (forceUid) {
    const account = findAccountByUid(forceUid);
    if (account) {
      setCurrentAccount(account);
    }
    return forceUid;
  }
  return null;
}

/**
 * Removes the current account from the cache and nullifies the current account uid
 */
export function clearSignedInAccountUid() {
  const account = getCurrentAccount();
  if (account) {
    unsetCurrentAccount();
    removeAccount(account);
  }
}

/**
 * Checks the state of the account object provided and returns false if it doesn't seem valid.
 * @param account
 * @returns
 */
function isValidAccount(account: StoredAccountData) {
  if ((account && typeof account.uid !== 'string') || !account.uid) {
    console.warn('Invalid account detected - missing uid');
    return false;
  }

  if ((account && typeof account.email !== 'string') || !account.email) {
    console.warn('Invalid account detected - missing email');
    return false;
  }

  // TBD - providing some more of these checks might shed some light on other issues.

  return true;
}

/**
 * Cleans up invalid cache states left in local storage.
 */
export function purgeInvalidAccounts() {
  const accounts = getAccounts();

  for (const x in accounts) {
    if (!isValidAccount(accounts[x])) {
      console.warn('Purging account due invalid state', accounts[x]);
      delete accounts[x];
    }

    if (accounts[x].uid !== x) {
      console.warn('Purging account due to uid mismatch', accounts[x]);
      delete accounts[x];
    }
  }
}
