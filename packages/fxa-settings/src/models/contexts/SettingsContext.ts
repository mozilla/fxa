/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';
import React from 'react';
import config from '../../lib/config';
import firefox, { FirefoxCommand } from '../../lib/channels/firefox';
import { createApolloClient } from '../../lib/gql';
import { Account, GET_PROFILE_INFO } from '../Account';
import { AlertBarInfo } from '../AlertBarInfo';

export const INITIAL_SETTINGS_QUERY = gql`
  query GetInitialSettingsState {
    account {
      uid
      displayName
      avatar {
        id
        url
        isDefault @client
      }
      accountCreated
      passwordCreated
      recoveryKey {
        exists
        estimatedSyncDeviceCount
      }
      metricsEnabled
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
        name
        lastAccessTime
        lastAccessTimeFormatted
        approximateLastAccessTime
        approximateLastAccessTimeFormatted
        location {
          city
          country
          state
          stateCode
        }
        os
        sessionTokenId
        refreshTokenId
      }
      totp {
        exists
        verified
      }
      backupCodes {
        hasBackupCodes
        count
      }
      recoveryPhone {
        exists
        phoneNumber
        nationalFormat
        available
      }
      subscriptions {
        created
        productName
      }
      linkedAccounts {
        providerId
        authAt
        enabled
      }
    }
    session {
      verified
    }
  }
`;

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
