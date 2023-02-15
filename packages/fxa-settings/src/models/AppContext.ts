/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient, gql } from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import React from 'react';
import config, { Config, readConfigMeta } from '../lib/config';
import firefox, { FirefoxCommand } from '../lib/firefox';
import { createApolloClient } from '../lib/gql';
import { OAuthClient } from '../lib/oauth/oauth-client';
import { RelierFactory } from '../lib/reliers';
import { Account, ACCOUNT_FIELDS, GET_PROFILE_INFO } from './Account';
import { AlertBarInfo } from './AlertBarInfo';
import { mockAppContext } from './mocks';
import { Session } from './Session';

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
  relierFactory?: RelierFactory;
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const oauthClient = new OAuthClient(config.servers.oauth.url);
  const authClient = new AuthClient(config.servers.auth.url);
  const apolloClient = createApolloClient(config.servers.gql.url);
  const account = new Account(authClient, apolloClient);
  const alertBarInfo = new AlertBarInfo();
  const relierFactory = new RelierFactory({
    delegates: {
      getClientInfo: (id: string) => oauthClient.getClientInfo(id),
      getProductInfo: (id: string) => authClient.getProductInfo(id),
      getProductIdFromRoute: () => {
        const re = new RegExp('/subscriptions/products/(.*)');
        return re.exec(window.location.pathname)?.[1] || '';
      },
    },
  });

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
    navigatorLanguages: navigator.languages || ['en'],
    relierFactory,
  } as AppContextValue;
}

export const AppContext = React.createContext<AppContextValue>(
  mockAppContext()
);
