/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import Storage from './storage';
import { dispatchStorageEvent } from './account-storage';
import firefox from './channels/firefox';
import config from './config';
import { Constants } from './constants';
import { isProbablyFirefox } from '../models/integrations/utils';

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
  sessionVerified?: boolean;
  alertText?: string;
  displayName?: string;
  hasPassword?: boolean;
  /** Profile scopes shown, by client id then scope. Shared with Backbone. */
  permissions?: Record<string, Record<string, boolean>>;
  /** Legacy form of `permissions`, still read for accounts that hold it. */
  grantedPermissions?: Record<string, string[]>;
}

/**
 * Persists account data to localStorage.
 * Merges with existing account data to preserve fields not being updated.
 */
export function persistAccount(accountData: StoredAccountData) {
  const storage = localStorage();
  const uid = accountData.uid;
  let accounts = storage.get('accounts') || {};

  const existingAccount = accounts[uid] || {};
  accounts[uid] = {
    ...existingAccount,
    ...accountData,
  };

  storage.set('accounts', accounts);
  dispatchStorageEvent('accounts');
}

/**
 * Checks to see there is an account stored in local storage for the give uid
 * @param uid An account id
 */
export function hasAccount(uid: string) {
  const storage = localStorage();
  let accounts = storage.get('accounts') || {};
  return !!accounts[uid];
}

/**
 * Sets the current account uid, aka the 'active' account id.
 * @param uid
 */
export function setCurrentAccount(uid: string) {
  const storage = localStorage();
  storage.set('currentAccountUid', uid);
  dispatchStorageEvent('currentAccountUid');
}

/**
 * Stores account data in local storage
 * @param accountData
 */
export function storeAccountData(accountData: StoredAccountData) {
  const replacedToken = (localStorage().get('accounts') || {})[accountData.uid]
    ?.sessionToken;
  persistAccount(accountData);
  setCurrentAccount(accountData.uid);
  if (
    replacedToken &&
    accountData.sessionToken &&
    replacedToken !== accountData.sessionToken
  ) {
    destroyReplacedSession(replacedToken);
  }
}

// Keeps a token the browser may hold, because destroying it signs the browser out.
async function destroyReplacedSession(sessionToken: hexstring) {
  try {
    if (isProbablyFirefox()) {
      // Firefox hides signedInUser in private browsing unless service is sync.
      const status = await firefox.fxaStatus({
        context: Constants.OAUTH_CONTEXT,
        isPairing: false,
        service: Constants.SYNC_SERVICE,
      });
      if (!status || status.signedInUser?.sessionToken === sessionToken) {
        return;
      }
    }
    await new AuthClient(config.servers.auth.url).sessionDestroy(sessionToken);
  } catch {
    // Best effort: a failed destroy must not block sign-in.
  }
}

export function getCurrentAccountData(): StoredAccountData {
  const storage = localStorage();
  const uid = storage.get('currentAccountUid');
  let accounts = storage.get('accounts') || {};
  return accounts[uid];
}
