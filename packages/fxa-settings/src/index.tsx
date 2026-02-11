/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import sentryMetrics from 'fxa-shared/sentry/browser';
import { AppErrorBoundary } from './components/ErrorBoundaries';
import App from './components/App';
import { NimbusProvider } from './models/contexts/NimbusContext';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import Storage from './lib/storage';
import './styles/tailwind.out.css';
import CookiesDisabled from './pages/CookiesDisabled';
import { navigate } from '@reach/router';
import { DynamicLocalizationProvider } from './contexts/DynamicLocalizationContext';

export interface FlowQueryParams {
  broker?: string;
  context?: string;
  deviceId?: string;
  flowBeginTime?: number;
  flowId?: string;
  entrypoint?: string;
  entrypoint_experiment?: string;
  entrypoint_variation?: string;
  form_type?: string;
  isSampledUser?: boolean;
  service?: string;
  uniqueUserId?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
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

  // Must be configured early. Otherwise baggage and sentry-trace headers won't be added
  sentryMetrics.configure({
    release: config.version,
    sentry: {
      ...config.sentry,
      tracesSampler: (context: { name?: string }) => {
        let rate = 0;
        // We only want to sample the index page for now.
        if (context.name === '/') {
          if (typeof config.sentry.tracesSampleRate === 'number') {
            rate = config.sentry.tracesSampleRate;
          }
        }
        return rate;
      },
    },
  });

  const appContext = initializeAppContext();

  const View = Storage.isLocalStorageEnabled(window)
    ? () => <App {...{ flowQueryParams }} />
    : () => {
        navigate('/cookies_disabled');
        return <CookiesDisabled />;
      };

  render(
    <React.StrictMode>
      <DynamicLocalizationProvider baseDir={config.l10n.baseUrl}>
        <AppErrorBoundary>
          <AppContext.Provider value={appContext}>
            <NimbusProvider>
              <View />
            </NimbusProvider>
          </AppContext.Provider>
        </AppErrorBoundary>
      </DynamicLocalizationProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
