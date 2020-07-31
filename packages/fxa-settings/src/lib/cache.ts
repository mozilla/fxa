import { InMemoryCache, makeVar, gql } from '@apollo/client';
import Storage from './storage'

const storage = Storage.factory('localStorage');

export function getSessionToken(): string {
  const storedAccounts = storage.get('accounts');
  const currentAccountUid = storage.get('currentAccountUid');
  // TODO: protect from if user doesn't have sessionToken (probably redirect them back to login)
  return storedAccounts[currentAccountUid].sessionToken;
}

export function sessionToken(token: string) {
  const storedAccounts = storage.get('accounts');
  const currentAccountUid = storage.get('currentAccountUid');
  storedAccounts[currentAccountUid].sessionToken = token;
  storage.set('accounts', storedAccounts)
}

// The hierarchy may change but starting simple
export const oldPassword = makeVar('')
export const newPassword = makeVar('')

export const typeDefs = gql`
  extend type Query {
    sessionToken: String!
    oldPassword: String
    newPassword: String
  }
`;

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        sessionToken: {
          read() {
            return getSessionToken()
          }
        },
        oldPassword: {
          read() {
            return oldPassword()
          }
        },
        newPassword: {
          read() {
            return newPassword()
          }
        }
      }
    }
  }
})
