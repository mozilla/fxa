import React, { useContext } from 'react';
import { gql, ApolloClient, useQuery } from '@apollo/client';
import config, { Config, getDefault, readConfigMeta } from '../lib/config';
import AuthClient from 'fxa-auth-client/browser';
import { createApolloClient } from '../lib/gql';
import { Account, ACCOUNT_FIELDS, GET_PROFILE_INFO } from './Account';
import { GET_SESSION_VERIFIED, Session } from './Session';
import firefox, { FirefoxCommand } from '../lib/firefox';
import { mockSession, MOCK_ACCOUNT } from './_mocks';
import { clearSignedInAccountUid } from '../lib/cache';

export const GET_INITIAL_STATE = gql`
  query GetInitialState {
    ${ACCOUNT_FIELDS}
    session {
      verified
    }
  }
`;

readConfigMeta((name: string) => {
  return document.head.querySelector(name);
});

const authClient = new AuthClient(config.servers.auth.url);
const apolloClient = createApolloClient(config.servers.gql.url);
const account = new Account(authClient, apolloClient);

const isForCurrentUser = (event: Event) => {
  const { account } = apolloClient.cache.readQuery<{ account: Account }>({
    query: gql`
      query GetUid {
        account {
          uid
        }
      }
    `,
  })!;
  return account.uid === (event as CustomEvent).detail.uid;
};

firefox.addEventListener(FirefoxCommand.ProfileChanged, (event) => {
  if (isForCurrentUser(event)) {
    apolloClient.query({
      query: GET_PROFILE_INFO,
      fetchPolicy: 'network-only',
    });
  }
});
firefox.addEventListener(FirefoxCommand.PasswordChanged, (event) => {
  if (isForCurrentUser(event)) {
    apolloClient.writeQuery({
      query: gql`
        query UpdatePasswordCreated {
          account {
            passwordCreated
          }
        }
      `,
      data: {
        account: {
          passwordCreated: Date.now(),
          __typename: 'Account',
        },
      },
    });
  }
});
firefox.addEventListener(FirefoxCommand.AccountDeleted, (event) => {
  if (isForCurrentUser(event)) {
    window.location.assign('/');
  }
});
firefox.addEventListener(FirefoxCommand.Error, (event) => {
  console.error(event);
});

export interface AppContextValue {
  authClient?: AuthClient;
  apolloClient?: ApolloClient<object>;
  config?: Config;
  account?: Account;
  session?: Session; // used exclusively for test mocking
}

export const autoContext = {
  authClient,
  apolloClient,
  config,
  account,
};
export const AppContext = React.createContext<AppContextValue>({
  account: (MOCK_ACCOUNT as unknown) as Account,
  session: mockSession(),
  config: getDefault(),
});

export function useAccount() {
  const { account } = useContext(AppContext);
  if (!account) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return account;
}

export function useSession() {
  const { apolloClient, session } = useContext(AppContext);
  if (session) {
    return session;
  }
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  const data = apolloClient.cache.readQuery<{ session: Session }>({
    query: GET_SESSION_VERIFIED,
  });
  const s = Object.assign({}, data!.session);
  // TODO: this feels like a temporary solution
  s.destroy = () =>
    apolloClient
      .mutate({
        mutation: gql`
          mutation destroySession($input: DestroySessionInput!) {
            destroySession(input: $input) {
              clientMutationId
            }
          }
        `,
        variables: { input: {} },
      })
      .then((result) => {
        clearSignedInAccountUid();
      });
  return s as Session;
}

export function useConfig() {
  const { config } = useContext(AppContext);
  if (!config) {
    return getDefault();
  }
  return config;
}

export function useInitialState() {
  const { apolloClient } = useContext(AppContext);
  if (!apolloClient) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }
  return useQuery(GET_INITIAL_STATE, { client: apolloClient });
}
