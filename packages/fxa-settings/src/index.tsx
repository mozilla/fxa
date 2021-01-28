/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider, gql } from '@apollo/client';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import sentryMetrics from 'fxa-shared/lib/sentry';
import App from './components/App';
import { AuthContext, createAuthClient } from './lib/auth';
import config, { readConfigMeta, ConfigContext } from './lib/config';
import firefox, { FirefoxCommand } from './lib/firefox';
import { createApolloClient } from './lib/gql';
import { searchParams } from './lib/utilities';
import { GET_PROFILE_INFO } from './models';
import './index.scss';

try {
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  sentryMetrics.configure(config.sentry.dsn, config.version);
  const authClient = createAuthClient(config.servers.auth.url);
  const apolloClient = createApolloClient(config.servers.gql.url);
  const flowQueryParams = searchParams(
    window.location.search
  ) as FlowQueryParams;
  const isForCurrentUser = (event: Event) => {
    const { account } = apolloClient.cache.readQuery<any>({
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

  render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <AuthContext.Provider value={{ auth: authClient }}>
          <ConfigContext.Provider value={config}>
            <AppErrorBoundary>
              <App {...{ flowQueryParams }} />
            </AppErrorBoundary>
          </ConfigContext.Provider>
        </AuthContext.Provider>
      </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
