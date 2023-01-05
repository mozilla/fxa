/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import {
  getTracingHeadersFromDocument,
  init as initTracing,
} from 'fxa-shared/tracing/browser-tracing';
import Settings from './components/Settings';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import './styles/tailwind.out.css';

interface FlowQueryParams {
  broker?: string;
  context?: string;
  deviceId?: string;
  flowBeginTime?: number;
  flowId?: string;
  isSampledUser?: boolean;
  service?: string;
  uniqueUserId?: string;
}

// temporary until we can safely direct all users to all routes currently in content-server
export interface QueryParams extends FlowQueryParams {
  showNewReactApp?: boolean;
}

try {
  const flowQueryParams = searchParams(window.location.search) as QueryParams;

  const { showNewReactApp } = flowQueryParams;

  // Populate config
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  // Add tracing support
  initTracing(
    config.tracing,
    {
      ...getTracingHeadersFromDocument(document),
      flowid: flowQueryParams.flowId,
    },
    console
  );

  const appContext = initializeAppContext();

  render(
    <React.StrictMode>
      <AppErrorBoundary>
        <AppContext.Provider value={appContext}>
          <AppLocalizationProvider
            baseDir="/settings/locales"
            bundles={['settings', 'react']}
            userLocales={navigator.languages}
          >
            {showNewReactApp ? (
              <App {...{ flowQueryParams }} />
            ) : (
              <Settings {...{ flowQueryParams }} />
            )}
          </AppLocalizationProvider>
        </AppContext.Provider>
      </AppErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
