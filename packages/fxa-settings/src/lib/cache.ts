import { InMemoryCache, gql } from '@apollo/client';
import Storage from './storage';
import { Email } from '../models';
import { searchParam } from '../lib/utilities';
import config from './config';
import { StoredAccountData } from './storage-utils';
import { v4 as uuid } from 'uuid';
import * as Sentry from '@sentry/browser';
import { Constants } from './constants';

const storage = Storage.factory('localStorage');

// TODO in FXA-8454
// Add checks to ensure this function cannot produce an object that would violate type safety.
// Currently, there are no checks to ensure that the values are defined and non-null,
// which could result in errors at runtime.
export function getStoredAccountData({
  uid,
  sessionToken,
  alertText,
  displayName,
  metricsEnabled,
  lastLogin,
  email,
  verified,
}: Record<string, any>): StoredAccountData {
  return {
    uid,
    sessionToken,
    alertText,
    displayName,
    metricsEnabled,
    lastLogin,
    email,
    verified,
  };
}

type LocalAccounts = Record<hexstring, StoredAccountData>;

function accounts(accounts?: LocalAccounts) {
  if (accounts) {
    storage.set('accounts', accounts);
    return accounts;
  }
  return storage.get('accounts') as LocalAccounts;
}

export function currentAccount(
  account?: StoredAccountData
): StoredAccountData | undefined {
  const all = accounts() || {};

  // Current user can be specified in url params (ex. when clicking
  // `Manage account` from sync prefs.
  const forceUid = searchParam('uid', window.location.search);
  if (forceUid && !['__proto__', 'constructor', 'prototype'].includes(forceUid) && all[forceUid]) {
    storage.set('currentAccountUid', forceUid);
  }

  const uid = storage.get('currentAccountUid') as hexstring;
  if (account) {
    if (!['__proto__', 'constructor', 'prototype'].includes(account.uid)) {
      all[account.uid] = account;
    }
    accounts(all);
    return account;
  }
  return all[uid];
}

export function getAccountByUid(uid: string) {
  const all = accounts() || {};
  return all[uid];
}

export function lastStoredAccount() {
  const all = accounts() || {};

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
  return latestAccount;
}

export function sessionToken(newToken?: hexstring) {
  try {
    const account = currentAccount();
    if (newToken) {
      account!.sessionToken = newToken;
      currentAccount(account);
    }
    return account!.sessionToken;
  } catch (e) {
    return null;
  }
}

/**
 * Discard a session token deemed to be invalid.
 */
export function discardSessionToken() {
  try {
    // TODO: do we need to discard other values? See
    // content-server's discardSessionToken
    const account = currentAccount();
    if (account) {
      account.sessionToken = undefined;
      currentAccount(account);
    }
  } catch (e) {
    // noop
  }
}

export function clearSignedInAccountUid() {
  const all = accounts() || {};
  const uid = storage.get('currentAccountUid') as hexstring;
  delete all[uid];
  accounts(all);
  storage.remove('currentAccountUid');
}

/**
 * Fetches or generates a new client ID that is stable for that browser client/cookie jar.
 *
 * N.B: Implemenation is taken from `fxa-content-server/.../models/unique-user-id.js` with
 * inlined code that was written using Backbone utilities which could not immediately be transferred over.
 * @returns a new or existing UUIDv4 for this user.
 */
export function getUniqueUserId(): string {
  function resumeTokenFromSearchParams(): string | null {
    // Check the url for a resume token, that might have a uniqueUserId
    const searchParams = new URLSearchParams(window.location.search);
    const resumeToken = searchParams.get('resume');
    return resumeToken;
  }

  function maybePersistFromToken(resumeToken: string) {
    // populateFromStringifiedResumeToken - fxa-content-server/.../mixins/resume-token.js
    if (resumeToken) {
      try {
        // createFromStringifiedResumeToken - fxa-content-server/.../models/resume-token.js
        const resumeTokenObj = JSON.parse(atob(resumeToken));
        if (typeof resumeTokenObj?.uniqueUserId === 'string') {
          // Key name is derived from the Local Storage implementation.
          // fullKey - fxa-content-server/.../lib/storage.ts
          storage.set('uniqueUserId', resumeTokenObj?.uniqueUserId);
          // Use uuid provided by resume token
          return resumeTokenObj?.uniqueUserId;
        }
      } catch (error) {
        Sentry.captureMessage('Failed parse resume token.', {
          extra: {
            resumeToken: resumeToken.substring(0, 10) + '...',
          },
        });
      }
    }
  }

  // Remove resume token bits from here in FXA-11310.
  const resumeToken = resumeTokenFromSearchParams();
  if (resumeToken) {
    maybePersistFromToken(resumeToken);
  }

  // Check local storage for an existing resume token
  let uniqueUserId = storage.get('uniqueUserId');
  // Generate a new token if one is not found!
  if (!uniqueUserId) {
    uniqueUserId = uuid();
    storage.set('uniqueUserId', uniqueUserId);
  }

  return uniqueUserId;
}

export function consumeAlertTextExternal() {
  const account = currentAccount();
  const text = account?.alertText || null;
  if (text) {
    account!.alertText = undefined;
    currentAccount(account);
  }
  return text;
}

// sessionToken is added as a local field as an example.
export const typeDefs = gql`
  extend type Account {
    primaryEmail: Email!
  }
  extend type Session {
    token: String!
  }
`;

export const cache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        primaryEmail: {
          read(_, o) {
            const emails = o.readField<Email[]>('emails');
            return emails?.find((email) => email.isPrimary);
          },
        },
      },
      keyFields: [],
    },
    Avatar: {
      fields: {
        isDefault: {
          read(_, o) {
            const url = o.readField<string>('url');
            const id = o.readField<string>('id');
            return !!(
              url?.startsWith(config.servers.profile.url) ||
              id?.startsWith('default')
            );
          },
        },
      },
    },
    Session: {
      fields: {
        token: {
          read() {
            return sessionToken();
          },
        },
      },
    },
  },
});

/*
 * Check that the React enrolled flag in local storage is set to `true`.
 * Note that if users don't hit the Backbone JS bundle, this is not going
 * to get set.
 */
export function isInReactExperiment() {
  const storageReactExp = storage.get(Constants.STORAGE_REACT_EXPERIMENT);
  try {
    const parsedData = JSON.parse(storageReactExp);
    return parsedData && parsedData.enrolled === true;
  } catch (error) {
    return false;
  }
}
