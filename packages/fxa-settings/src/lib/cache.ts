import { InMemoryCache, gql } from '@apollo/client';
import Storage from './storage';

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
  extend type Session {
    token: String!
  }
`;

export const cache = new InMemoryCache({
  typePolicies: {
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
