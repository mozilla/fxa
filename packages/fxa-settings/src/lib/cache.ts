import { InMemoryCache, gql } from '@apollo/client';
import Storage from './storage';
import { Email } from '../models';

const storage = Storage.factory('localStorage');

export function sessionToken(newToken?: string) {
  try {
    const storedAccounts = storage.get('accounts');
    const currentAccountUid = storage.get('currentAccountUid');
    if (newToken) {
      storedAccounts[currentAccountUid].sessionToken = newToken;
      storage.set('accounts', storedAccounts);
    }
    return storedAccounts[currentAccountUid].sessionToken as string;
  } catch (e) {
    return null;
  }
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
