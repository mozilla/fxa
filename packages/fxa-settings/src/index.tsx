/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import App from './components/App';
import { AuthContext, createAuthClient } from './lib/auth';
import sentryMetrics from 'fxa-shared/lib/sentry';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { createApolloClient } from './lib/gql';
import './index.scss';

try {
  sentryMetrics.configure(config.sentry.dsn, config.version);
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const authClient = createAuthClient(config.servers.auth.url);
  const apolloClient = createApolloClient(config.servers.gql.url);
  const flowQueryParams = searchParams(
    window.location.search
  ) as FlowQueryParams;

  render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <AuthContext.Provider value={{ auth: authClient }}>
          <AppErrorBoundary>
            <App {...{ flowQueryParams }} />
          </AppErrorBoundary>
        </AuthContext.Provider>
      </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
