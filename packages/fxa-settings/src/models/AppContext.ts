/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient, gql } from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import React from 'react';
import config, { Config, readConfigMeta, getDefault } from '../lib/config';
import { StorageData, UrlHashData, UrlQueryData } from '../lib/model-data';
import firefox, { FirefoxCommand } from '../lib/channels/firefox';
import { createApolloClient } from '../lib/gql';
import { OAuthClient } from '../lib/oauth/oauth-client';
import { Account, ACCOUNT_FIELDS, GET_PROFILE_INFO } from './Account';
import { AlertBarInfo } from './AlertBarInfo';
import { Session } from './Session';
import { LocationStateData } from '../lib/model-data/data-stores/location-state-data';
import { ReachRouterWindow } from '../lib/window';

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
  oauthClient?: OAuthClient;
  apolloClient?: ApolloClient<object>;
  config?: Config;
  account?: Account;
  alertBarInfo?: AlertBarInfo;
  session?: Session; // used exclusively for test mocking
  navigatorLanguages?: readonly string[];
  urlQueryData?: UrlQueryData;
  urlHashData?: UrlHashData;
  storageData?: StorageData;
  windowWrapper?: ReachRouterWindow;
  locationStateData?: LocationStateData;
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

  const windowWrapper = new ReachRouterWindow();
  const urlQueryData = new UrlQueryData(windowWrapper);
  const urlHashData = new UrlHashData(windowWrapper);
  const storageData = new StorageData(windowWrapper);
  const locationStateData = new LocationStateData(windowWrapper);

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
  firefox.addEventListener(FirefoxCommand.FxAStatus, (event) => {
    // TODO: This event should be registered in the RelierFactory or Notifier
    // since they would be doing different things based on the response.
    // const response = (event as CustomEvent).detail as FxAStatusResponse;
  });

  const context: AppContextValue = {
    authClient,
    oauthClient,
    apolloClient,
    config,
    account,
    alertBarInfo,
    urlQueryData,
    urlHashData,
    storageData,
    locationStateData,
    navigatorLanguages: navigator.languages || ['en'],
    windowWrapper,
  };

  return context;
}

export function defaultAppContext(context?: AppContextValue) {
  const account = {
    uid: 'abc123',
    displayName: 'John Dope',
    avatar: {
      id: 'abc1234',
      url: 'http://placekitten.com/512/512',
      isDefault: false,
    },
    accountCreated: 123456789,
    passwordCreated: 123456789,
    hasPassword: true,
    recoveryKey: true,
    metricsEnabled: true,
    attachedClients: [],
    subscriptions: [],
    primaryEmail: {
      email: 'johndope@example.com',
      isPrimary: true,
      verified: true,
    },
    emails: [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
    ],
    totp: {
      exists: true,
      verified: true,
    },
    linkedAccounts: [],
    securityEvents: [],
  };
  const session = {
    verified: true,
    token: 'deadc0de',
  };
  const storageData = {
    get: () => 'deadc0de',
    setItem(_key: string, _value: string) {
      return;
    },
  };
  return Object.assign(
    {
      account,
      session,
      config: getDefault(),
      alertBarInfo: new AlertBarInfo(),
      storageData,
    },
    context
  ) as AppContextValue;
}

export const AppContext = React.createContext<AppContextValue>(
  defaultAppContext()
);
