/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sentryMetrics from 'fxa-shared/sentry/browser';

import React from 'react';
import { render } from 'react-dom';
import { ErrorBoundary } from './components/ErrorBoundaries';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from './lib/gql';
import './styles/tailwind.out.css';

export interface FlowQueryParams {
  broker?: string;
  context?: string;
  deviceId?: string;
  flowBeginTime?: number;
  flowId?: string;
  isSampledUser?: boolean;
  service?: string;
  uniqueUserId?: string;
}

// Temporary query params
export interface QueryParams extends FlowQueryParams {
  showReactApp?: string;
}

try {
  const flowQueryParams = searchParams(window.location.search) as QueryParams;

  // Populate config
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  // Must be configured before apollo is created. Otherwise baggage and sentry-trace headers won't be added
  sentryMetrics.configure({
    release: config.version,
    sentry: {
      ...config.sentry,
    },
  });

  const apolloClient = createApolloClient(config.servers.gql.url);
  const appContext = initializeAppContext();

  render(
    <React.StrictMode>
      <AppLocalizationProvider
        baseDir={config.l10n.baseUrl}
        userLocales={navigator.languages}
      >
        <ErrorBoundary>
          <AppContext.Provider value={appContext}>
            <ApolloProvider client={apolloClient}>
              <App {...{ flowQueryParams }} />
            </ApolloProvider>
          </AppContext.Provider>
        </ErrorBoundary>
      </AppLocalizationProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
