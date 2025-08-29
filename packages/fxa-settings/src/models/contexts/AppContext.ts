/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/browser';

import AuthClient from 'fxa-auth-client/browser';
import React from 'react';
import config, { Config, readConfigMeta, getDefault } from '../../lib/config';
import { Account } from '../Account';
import { Session } from '../Session';
import { AlertBarInfo } from '../AlertBarInfo';
import { KeyStretchExperiment } from '../experiments/key-stretch-experiment';
import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import { SensitiveDataClient } from '../../lib/sensitive-data-client';
import { initializeNimbus, NimbusContextT } from '../../lib/nimbus';
import { parseAcceptLanguage } from '../../../../../libs/shared/l10n/src';
import { searchParams } from '../../lib/utilities';
import { uuidCache, accountCache } from '../../lib/cache';
import { createApolloClient } from '../../lib/apollo/apollo-client';

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

/**
 * Fetches or generates a new client ID that is stable for that browser client/cookie jar.
 *
 * N.B: Implementation is taken from `fxa-content-server/.../models/unique-user-id.js` with
 * inlined code that was written using Backbone utilities which could not immediately be transferred over.
 * @returns a new or existing UUIDv4 for this user.
 */
export function getUniqueUserId(): string {
  function resumeTokenFromSearchParams(): string | null {
    // Check the url for a resume token, that might have a uniqueUserId
    const searchParams = new URLSearchParams(window.location.search);
    const resumeToken = searchParams.get('resume');
    return resumeToken;
  }

  function maybePersistFromToken(resumeToken: string) {
    // populateFromStringifiedResumeToken - fxa-content-server/.../mixins/resume-token.js
    if (resumeToken) {
      try {
        // createFromStringifiedResumeToken - fxa-content-server/.../models/resume-token.js
        const resumeTokenObj = JSON.parse(atob(resumeToken));
        if (typeof resumeTokenObj?.uniqueUserId === 'string') {
          uuidCache.setUUID(resumeTokenObj.uniqueUserId);
          return resumeTokenObj.uniqueUserId;
        }
      } catch (error) {
        Sentry.captureMessage('Failed parse resume token.', {
          extra: {
            resumeToken: resumeToken.substring(0, 10) + '...',
          },
        });
      }
    }
  }

  // Remove resume token bits from here in FXA-11310.
  const resumeToken = resumeTokenFromSearchParams();
  if (resumeToken) {
    maybePersistFromToken(resumeToken);
  }

  // Check local storage for an existing resume token
  let uniqueUserId = uuidCache.getUUID();
  // Generate a new token if one is not found!
  if (!uniqueUserId) {
    uniqueUserId = uuidCache.createUUID();
    uuidCache.setUUID(uniqueUserId);
  }

  return uniqueUserId;
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
  const uniqueUserId = uuidCache.getUUID();
  const experiments = fetchNimbusExperiments(uniqueUserId);

  // Make sure we don't have any invalid account states cached in local storage. This could cause problems down the road...
  accountCache.purgeInvalidAccounts();

  // This used to happen automatically whenever a 'stored account' was
  // accessed. This approach seems cleaner and more transparent and less likely
  // to cause problems mid flow if the account is changed but the UID
  // in the query params isn't also updated.
  const currentAccountUid =
    accountCache.forceCurrentAccountFromUidQueryParams();

  // TODO: Remove once we see how prevalent this actually is. I'm not sure we
  //       even rely on this anymore.
  if (currentAccountUid) {
    Sentry.captureMessage('Forcing UID through query params');
    console.info('Forcing uid through query params!');
  }

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

export const AppContext =
  React.createContext<AppContextValue>(defaultAppContext());
