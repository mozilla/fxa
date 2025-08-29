/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';
import React from 'react';
import config from '../../lib/config';
import firefox, { FirefoxCommand } from '../../lib/channels/firefox';
import { AlertBarInfo } from '../AlertBarInfo';
import { createApolloClient } from '../../lib/apollo/apollo-client';
import { apolloCache } from '../../lib/cache';

// TODO, move some values from AppContext to SettingsContext after
// using container components, FXA-8107
export interface SettingsContextValue {
  alertBarInfo?: AlertBarInfo;
  navigatorLanguages?: readonly string[];
}

export function initializeSettingsContext() {
  const alertBarInfo = new AlertBarInfo();
  const apolloClient = createApolloClient(config.servers.gql.url);

  const isForCurrentUser = (event: Event) => {
    const result = apolloCache.getAccountUid();
    return result?.account.uid === (event as CustomEvent).detail.uid;
  };

  firefox.addEventListener(FirefoxCommand.ProfileChanged, (event) => {
    if (isForCurrentUser(event)) {
      // Does this just update the cache state? If so why not just use account...
      // Also why is this not awaited?
      // This query used to be in Account.ts, but was only referenced by
      // Account->getProfileInfo, which was never used!
      apolloClient.query({
        query: gql`
          query GetProfileInfo {
            account {
              uid
              displayName
              avatar {
                id
                url
              }
              primaryEmail @client
              emails {
                email
                isPrimary
                verified
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      });
    }
  });
  firefox.addEventListener(FirefoxCommand.PasswordChanged, (event) => {
    if (isForCurrentUser(event)) {
      // TBD! Wut!? why is firefox letting us know the password changed. Don't
      // we handle this?
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

  const context: SettingsContextValue = {
    alertBarInfo,
    navigatorLanguages: navigator.languages || ['en'],
  };

  return context;
}

export function defaultSettingsContext(context?: SettingsContextValue) {
  return Object.assign(
    {
      alertBarInfo: new AlertBarInfo(),
      navigatorLanguages: navigator.languages || ['en'],
    },
    context
  ) as SettingsContextValue;
}

export const SettingsContext = React.createContext<SettingsContextValue>(
  defaultSettingsContext()
);
