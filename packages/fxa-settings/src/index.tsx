/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sentryMetrics from 'fxa-shared/sentry/browser';

import React from 'react';
import { render } from 'react-dom';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { shouldSendFxAStatus, searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from './lib/gql';
import firefox from './lib/channels/firefox';
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

  const completeInitialization = () => {
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
  };

  if (shouldSendFxAStatus(flowQueryParams.context)) {
    firefox
      .fxaStatus({
        service:
          flowQueryParams.context === 'fx_desktop_v3' ? 'sync' : undefined,
        context: flowQueryParams.context,
      })
      .then((message) => {
        const signedInUser = message.signedInUser;
        if (signedInUser) {
          currentAccount({
            ...signedInUser,
            // The FxA status message does not include the time the user
            // last signed in, we default it to now
            lastLogin: Date.now(),
            metricsEnabled: true,
          });
        }
      })
      .catch((error) => {
        console.error('Error requesting FxA status from browser', error);
      })
      .finally(() => completeInitialization());
  } else {
    completeInitialization();
  }
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
