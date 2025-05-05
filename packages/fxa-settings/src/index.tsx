/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sentryMetrics from 'fxa-shared/sentry/browser';

import React from 'react';
import { AppErrorBoundary } from './components/ErrorBoundaries';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from './lib/gql';
import Storage from './lib/storage';
import './styles/tailwind.out.css';
import CookiesDisabled from './pages/CookiesDisabled';
import { navigate } from '@reach/router';
import { createRoot } from 'react-dom/client';

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

  const View = Storage.isLocalStorageEnabled(window)
    ? () => <App {...{ flowQueryParams }} />
    : () => {
        navigate('/cookies_disabled');
        return <CookiesDisabled />;
      };

  const container = document.getElementById('root');
  if (!container) throw new Error('Missing #root element');

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <AppLocalizationProvider
        baseDir={config.l10n.baseUrl}
        userLocales={navigator.languages}
      >
        <AppErrorBoundary>
          <AppContext.Provider value={appContext}>
            <ApolloProvider client={apolloClient}>
              <View />
            </ApolloProvider>
          </AppContext.Provider>
        </AppErrorBoundary>
      </AppLocalizationProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
