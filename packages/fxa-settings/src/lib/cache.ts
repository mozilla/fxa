import { InMemoryCache, gql, makeVar } from '@apollo/client';
import Storage from './storage';
import { Email } from '../models';

const storage = Storage.factory('localStorage');

export interface OldSettingsData {
  uid: hexstring;
  sessionToken: hexstring;
  alertText?: string;
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

function currentAccount(account?: OldSettingsData) {
  const all = accounts() || {};
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

function consumeAlertTextExternal() {
  const account = currentAccount();
  const text = account?.alertText || null;
  if (text) {
    account!.alertText = undefined;
    currentAccount(account);
  }
  return text;
}

export const alertTextExternal = makeVar(consumeAlertTextExternal());

// sessionToken is added as a local field as an example.
export const typeDefs = gql`
  extend type Account {
    primaryEmail: Email!
    alertTextExternal: String
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
        alertTextExternal: {
          read() {
            return alertTextExternal();
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
