/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sentryMetrics from 'fxa-shared/sentry/browser';

import React from 'react';
import { render } from 'react-dom';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from './lib/gql';
import firefox, { FirefoxCommand, SignedInUser } from './lib/channels/firefox';
import { currentAccount } from './lib/cache';
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
  // We do a best effort recovery of the user's signed in state
  // There is no guarantee the event will be triggered before we
  // have initialized our GraphQL client, because that depends on the
  // browser responding to the web channel message quickly enough
  firefox.addEventListener(FirefoxCommand.FxAStatus, (event) => {
    const signedInUser = (event as any).detail.signedInUser as
      | SignedInUser
      | undefined;
    if (signedInUser) {
      currentAccount({
        ...signedInUser,
        // The FxA status message does not include the time the user
        // last signed in, we default it to now
        lastLogin: Date.now(),
        metricsEnabled: true,
      });
    }
    firefox.removeEventListener(FirefoxCommand.FxAStatus, null);
  });

  firefox.fxaStatus({
    service: flowQueryParams.context === 'fx_desktop_v3' ? 'sync' : undefined,
    context: flowQueryParams.context,
  });

  const apolloClient = createApolloClient(config.servers.gql.url);
  const appContext = initializeAppContext();

  render(
    <React.StrictMode>
      <AppErrorBoundary>
        <AppContext.Provider value={appContext}>
          <AppLocalizationProvider
            baseDir="/settings/locales"
            userLocales={navigator.languages}
          >
            <ApolloProvider client={apolloClient}>
              <App {...{ flowQueryParams }} />
            </ApolloProvider>
          </AppLocalizationProvider>
        </AppContext.Provider>
      </AppErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
