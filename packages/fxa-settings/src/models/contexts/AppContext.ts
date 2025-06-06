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
import { SensitiveDataClient } from '../../lib/sensitive-data-client';
import { initializeNimbus, NimbusContextT } from '../../lib/nimbus';
import { parseAcceptLanguage } from '../../../../../libs/shared/l10n/src';
import { getUniqueUserId } from '../../lib/cache';
import { searchParams } from '../../lib/utilities';

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
  experiments?: Promise<any>; // external response; not adding types
}

export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

/**
 * Fetches nimbus experiments from the Cirrus container via content-server.
 *
 * N.B: external response; not adding types
 *
 * @param uniqueUserId the ID that is used to retrieve the experiments for that client.
 * @returns a promise to the fetch JSON reponse.
 */
function fetchNimbusExperiments(uniqueUserId: string): Promise<any> {
  // We reuse parseAcceptLanguage with navigator.languages because
  // that is the same as getting the headers directly as stated on MDN.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
  const [locale] = parseAcceptLanguage(navigator.languages.join(', '));
  let [language, region] = locale.split('-');
  if (region) {
    region = region.toLowerCase();
  }

  const nimbusPreview = config.nimbusPreview
    ? config.nimbusPreview
    : searchParams(window.location.search).nimbusPreview === 'true';

  return initializeNimbus(uniqueUserId, nimbusPreview, {
    language,
    region,
  } as NimbusContextT);
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const authClient = new AuthClient(config.servers.auth.url, {
    keyStretchVersion: 2,
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
