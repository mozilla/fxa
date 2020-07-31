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

// sessionToken is added as a local field in the cache as an example.
export const typeDefs = gql`
  extend type Query {
    sessionToken: String!
  }
`;

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        sessionToken: {
          read() {
            return sessionToken();
          },
        },
      },
    },
  },
});
