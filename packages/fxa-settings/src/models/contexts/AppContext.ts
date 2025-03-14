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
import { initializeNimbus, NimbusContextT } from '../../lib/nimbus';
import { parseAcceptLanguage } from '../../../../../libs/shared/l10n/src';
import { getUniqueUserId } from '../../lib/cache';

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
  experiments?: any; // TODO: add types for experiments
}

export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

function fetchNimbusExperiments(uniqueUserId: string) {
  // We reuse parseAcceptLanguage with navigator.languages because
  // that is the same as getting the headers directly as stated on MDN.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
  const [locale] = parseAcceptLanguage(navigator.languages.join(', '));
  let [language, region] = locale.split('-');
  if (region) {
    region = region.toLowerCase();
  }

  return initializeNimbus(uniqueUserId, { language, region } as NimbusContextT);
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const keyStretchExperiment = new KeyStretchExperiment(
    new UrlQueryData(new ReachRouterWindow())
  );
  const authClient = new AuthClient(config.servers.auth.url, {
    keyStretchVersion: keyStretchExperiment.isV2(config) ? 2 : 1,
  });
  const apolloClient = createApolloClient(config.servers.gql.url);
  const account = new Account(authClient, apolloClient);
  const session = new Session(authClient, apolloClient);
  const sensitiveDataClient = new SensitiveDataClient();
  const uniqueUserId = getUniqueUserId();
  const experiments = fetchNimbusExperiments(uniqueUserId);

  const context: AppContextValue = {
    authClient,
    apolloClient,
    config,
    account,
    session,
    sensitiveDataClient,
    uniqueUserId,
    experiments,
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

export const AppContext = React.createContext<AppContextValue>(
  defaultAppContext()
);
