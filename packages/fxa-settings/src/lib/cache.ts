import { InMemoryCache, gql } from '@apollo/client';
import Storage from './storage';
import { Email } from '../models';
import { searchParam } from '../lib/utilities';
import config from './config';
import { StoredAccountData } from './storage-utils';

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
  if (forceUid && all[forceUid]) {
    storage.set('currentAccountUid', forceUid);
  }

  const uid = storage.get('currentAccountUid') as hexstring;
  if (account) {
    all[account.uid] = account;
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
