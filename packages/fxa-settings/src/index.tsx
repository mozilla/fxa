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
import { FlowContext } from './models/FlowContext';
import './styles/tailwind.out.css';

try {
  const queryParams = searchParams(window.location.search) as FlowQueryParams &
    ExperimentStatusParams;

  const flowQueryParams = {
    broker: queryParams.broker,
    context: queryParams.context,
    deviceId: queryParams.deviceId,
    flowBeginTime: queryParams.flowBeginTime,
    flowId: queryParams.flowId,
    isSampledUser: queryParams.isSampledUser,
    service: queryParams.service,
    uniqueUserId: queryParams.uniqueUserId,
  };

  const { showNewReactApp } = queryParams;

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
      <AppContext.Provider value={appContext}>
        <FlowContext.Provider value={flowQueryParams}>
          <AppLocalizationProvider
            baseDir="/settings/locales"
            bundles={['settings']}
            userLocales={navigator.languages}
          >
            <AppErrorBoundary>
              {showNewReactApp ? <App /> : <Settings />}
            </AppErrorBoundary>
          </AppLocalizationProvider>
        </FlowContext.Provider>
      </AppContext.Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
