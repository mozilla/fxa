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
import AppSettings from './components/settings/App';
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppSettingsContext, initializeAppSettingsContext } from './models';
import './styles/tailwind.out.css';

try {
  // Get all query params
  const clientQueryParams = searchParams(
    window.location.search
  ) as FlowQueryParams & ShowNewReactApp;

  // Check for flow id
  const flowQueryParams = {
    broker: clientQueryParams.broker,
    context: clientQueryParams.context,
    deviceI: clientQueryParams.deviceId,
    flowBeginTime: clientQueryParams.flowBeginTime,
    flowId: clientQueryParams.flowId,
    isSampledUser: clientQueryParams.isSampledUser,
    service: clientQueryParams.service,
    uniqueUserId: clientQueryParams.uniqueUserId,
  } as FlowQueryParams;

  const showNewReactApp = clientQueryParams.showNewReactApp;

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

  const appSettingsContext = initializeAppSettingsContext();

  render(
    <React.StrictMode>
      <AppSettingsContext.Provider value={appSettingsContext}>
        <AppErrorBoundary>
          {
            showNewReactApp ?
          <App
            {...{
              flowQueryParams,
              navigatorLanguages: navigator.languages,
            }}
          />
          :
          <AppSettings
          {...{
            flowQueryParams,
            navigatorLanguages: navigator.languages,
          }}
          />
          }
        </AppErrorBoundary>
      </AppSettingsContext.Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
