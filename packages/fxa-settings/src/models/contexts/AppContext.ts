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
import { v4 as uuid } from 'uuid';
import * as Sentry from '@sentry/browser';

// TODO, move some values from AppContext to SettingsContext after
// using container components, FXA-8107
export interface AppContextValue {
  authClient?: AuthClient;
  apolloClient?: ApolloClient<object>;
  config?: Config;
  account?: Account;
  session?: Session; // used exclusively for test mocking
  uniqueUserId?: string; // used for experiments
}

export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

export function getUniqueUserId() {
  // Check the url for a resume token, that might have a uniqueUserId
  const searchParams = new URLSearchParams(window.location.search);
  const resumeToken = searchParams.get('resume');
  if (resumeToken) {
    try {
      const resumeTokenObj = JSON.parse(atob(resumeToken));
      if (typeof resumeTokenObj?.uniqueUserId === 'string') {
        localStorage.setItem(
          `__fxa_storage.uniqueUserId`,
          resumeTokenObj?.uniqueUserId
        );

        // Use uuid provided by resume token
        return resumeTokenObj?.uniqueUserId;
      }
    } catch (error) {
      Sentry.captureMessage('Failed parse resume token.', {
        extra: {
          resumeToken: resumeToken.substring(0, 10) + '...',
        },
      });
    }
  }

  // Check local storage for an existing resume token
  let uniqueUserId = localStorage.getItem(`__fxa_storage.uniqueUserId`);

  // Generate a new token if one is not found!
  if (!uniqueUserId) {
    uniqueUserId = uuid();
    localStorage.setItem(`__fxa_storage.uniqueUserId`, uniqueUserId);
  }

  return uniqueUserId;
}

export function initializeAppContext() {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const uniqueUserId = getUniqueUserId();

  const keyStretchExperiment = new KeyStretchExperiment(
    new UrlQueryData(new ReachRouterWindow())
  );
  const authClient = new AuthClient(config.servers.auth.url, {
    keyStretchVersion: keyStretchExperiment.isV2(config) ? 2 : 1,
  });
  const apolloClient = createApolloClient(config.servers.gql.url);
  const account = new Account(authClient, apolloClient);
  const session = new Session(authClient, apolloClient);

  const context: AppContextValue = {
    authClient,
    apolloClient,
    config,
    account,
    session,
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
