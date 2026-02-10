/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient } from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import React from 'react';
import config, { Config, readConfigMeta, getDefault } from '../../lib/config';
import { createApolloClient } from '../../lib/gql';
import { Account } from '../Account';
import { Session } from '../Session';
import { AlertBarInfo } from '../AlertBarInfo';
import { KeyStretchExperiment } from '../experiments/key-stretch-experiment';
import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import { SensitiveDataClient } from '../../lib/sensitive-data-client';
import { currentAccount, getUniqueUserId } from '../../lib/cache';
import { AuthUiErrors, isAuthUiError } from '../../lib/auth-errors/auth-errors';
import { navigateWithQuery } from '../../lib/utilities';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../../components/App/gql';

// TODO, move some values from AppContext to SettingsContext after
// using container components, FXA-8107
export interface AppContextValue {
  authClient?: AuthClient;
  apolloClient?: ApolloClient<object>;
  sensitiveDataClient?: SensitiveDataClient; // used for sensitive data that needs to be encrypted between components
  config?: Config;
  account?: Account;
  session?: Session;
  uniqueUserId?: string; // used for experiments
}

export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const keyStretchExperiment = new KeyStretchExperiment(
    new UrlQueryData(new ReachRouterWindow())
  );

  const apolloClient = createApolloClient(config.servers.gql.url);

  const authClient = new AuthClient(config.servers.auth.url, {
    keyStretchVersion: keyStretchExperiment.isV2(config) ? 2 : 1,
    errorHandler: async (error) => {
      if (isAuthUiError(error)) {
        if (
          error.errno === AuthUiErrors.INSUFFICIENT_AAL.errno &&
          window?.location.pathname.includes('settings')
        ) {
          const cache = apolloClient.cache;
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              totp(_, { DELETE }) {
                return DELETE;
              },
            },
          });

          const storedAccount = currentAccount();
          await navigateWithQuery('/signin_totp_code', {
            state: {
              email: storedAccount?.email,
              sessionToken: storedAccount?.sessionToken,
              uid: storedAccount?.uid,
              verified: storedAccount?.verified,
              isSessionAALUpgrade: true,
            },
          });
        } else if (
          error.errno === AuthUiErrors.INVALID_TOKEN.errno &&
          window?.location.pathname.includes('settings')
        ) {
          apolloClient.cache.writeQuery({
            query: GET_LOCAL_SIGNED_IN_STATUS,
            data: { isSignedIn: false },
          });
        }
      }
      throw error;
    },
  });

  const account = new Account(authClient, apolloClient);
  const session = new Session(authClient, apolloClient);
  const sensitiveDataClient = new SensitiveDataClient();
  const uniqueUserId = getUniqueUserId();

  const context: AppContextValue = {
    authClient,
    apolloClient,
    config,
    account,
    session,
    sensitiveDataClient,
    uniqueUserId,
  };

  return context;
}

export function defaultAppContext(context?: AppContextValue) {
  const account = {
    uid: 'abc123',
    displayName: 'John Dope',
    avatar: {
      id: 'abc1234',
      url: 'https://loremflickr.com/512/512',
      isDefault: false,
    },
    accountCreated: 123456789,
    passwordCreated: 123456789,
    hasPassword: true,
    recoveryKey: {
      exists: true,
      estimatedSyncDeviceCount: 0,
    },
    metricsEnabled: true,
    attachedClients: [],
    subscriptions: [],
    email: 'johndope@example.com',
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
    backupCodes: {
      hasBackupCodes: false,
      count: 0,
    },
    linkedAccounts: [],
    securityEvents: [],
    recoveryPhone: {
      exists: false,
      phoneNumber: null,
      available: false,
    },
  };
  const session = {
    verified: true,
    token: 'deadc0de',
  };
  return Object.assign(
    {
      account,
      session,
      config: getDefault(),
    },
    context
  ) as AppContextValue;
}

export const AppContext =
  React.createContext<AppContextValue>(defaultAppContext());
