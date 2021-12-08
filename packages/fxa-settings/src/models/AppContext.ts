import React from 'react';
import { gql, ApolloClient } from '@apollo/client';
import config, { Config, readConfigMeta } from '../lib/config';
import AuthClient from 'fxa-auth-client/browser';
import { createApolloClient } from '../lib/gql';
import { Account, ACCOUNT_FIELDS, GET_PROFILE_INFO } from './Account';
import { Session } from './Session';
import firefox, { FirefoxCommand } from '../lib/firefox';
import { mockAppContext } from './mocks';
import { AlertBarInfo } from './AlertBarInfo';

export const GET_INITIAL_STATE = gql`
  query GetInitialState {
    ${ACCOUNT_FIELDS}
    session {
      verified
    }
  }
`;

export interface AppContextValue {
  authClient?: AuthClient;
  apolloClient?: ApolloClient<object>;
  config?: Config;
  account?: Account;
  alertBarInfo?: AlertBarInfo;
  session?: Session; // used exclusively for test mocking
  navigatorLanguages?: readonly string[];
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const authClient = new AuthClient(config.servers.auth.url);
  const apolloClient = createApolloClient(config.servers.gql.url);
  const account = new Account(authClient, apolloClient);
  const alertBarInfo = new AlertBarInfo();

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
  return {
    authClient,
    apolloClient,
    config,
    account,
    alertBarInfo,
    navigatorLanguages: navigator.languages || ['en-US', 'en'],
  } as AppContextValue;
}

export const AppContext = React.createContext<AppContextValue>(
  mockAppContext()
);
