import { InMemoryCache, gql } from '@apollo/client';
import Storage from './storage';
import { Email } from '../models';
import { searchParam } from '../lib/utilities';
import config from './config';

const storage = Storage.factory('localStorage');

export interface OldSettingsData {
  uid: hexstring;
  sessionToken: hexstring;
  alertText?: string;
  displayName?: string;
  metricsEnabled?: boolean;
  email?: string;
}

export function getOldSettingsData({
  uid,
  sessionToken,
  alertText,
  displayName,
  metricsEnabled,
}: Record<string, any>): OldSettingsData {
  return {
    uid,
    sessionToken,
    alertText,
    displayName,
    metricsEnabled,
  };
}

type LocalAccount = OldSettingsData | undefined;
type LocalAccounts = Record<hexstring, LocalAccount> | undefined;

function accounts(accounts?: LocalAccounts) {
  if (accounts) {
    storage.set('accounts', accounts);
    return accounts;
  }
  return storage.get('accounts') as LocalAccounts;
}

export function currentAccount(account?: OldSettingsData) {
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
