/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { sessionToken } from './cache';
import Storage from './storage';

const ORIGINAL_TAB_KEY = 'originalTab';

function localStorage() {
  return Storage.factory('localStorage');
}

function sessionStorage() {
  return Storage.factory('sessionStorage');
}

export function isOriginalTab() {
  const storage = sessionStorage();
  let value = storage.get(ORIGINAL_TAB_KEY);

  // Fallback for content server's applied state.
  if (value === undefined) {
    value = window.sessionStorage.getItem(ORIGINAL_TAB_KEY);
  }

  return value;
}

export function clearOriginalTab() {
  const storage = sessionStorage();
  return storage.remove(ORIGINAL_TAB_KEY);
}

export function setOriginalTabMarker() {
  const storage = sessionStorage();
  storage.set(ORIGINAL_TAB_KEY, '1');
}

const OAUTH_KEY = 'oauth';
export function clearOAuthData() {
  const storage = sessionStorage();
  storage.remove(OAUTH_KEY);
}

/**
 * `lastLogin`, `email`, `metricsEnabled`, and `verified` should always be defined.
 *  However, since this is data in local storage, we can't make any guarantees.
 *  `uid` will always be set because it's the key used for the accounts object.
 * */
export interface StoredAccountData {
  uid: hexstring;
  lastLogin?: number;
  email?: string;
  sessionToken?: hexstring;
  metricsEnabled?: boolean;
  verified?: boolean;
  alertText?: string;
  displayName?: string;
}

/**
 * Persists account data to localStorage.
 */
export function persistAccount(accountData: StoredAccountData) {
  const storage = localStorage();
  const uid = accountData.uid;
  let accounts = storage.get('accounts') || {};

  // add the account to local storage
  accounts[uid] = accountData;

  storage.set('accounts', accounts);
}

export function setCurrentAccount(uid: string) {
  const storage = localStorage();
  storage.set('currentAccountUid', uid);
}

export function storeAccountData(accountData: StoredAccountData) {
  persistAccount(accountData);
  setCurrentAccount(accountData.uid);
  sessionToken(accountData.sessionToken); // Can we remove this? It seems unnecessary...
}
