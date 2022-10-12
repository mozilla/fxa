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
import App from './components/App';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import './styles/tailwind.out.css';

try {
  // Check for flow id
  const flowQueryParams = searchParams(
    window.location.search
  ) as FlowQueryParams;

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
        <AppErrorBoundary>
          <App
            {...{
              flowQueryParams,
              navigatorLanguages: navigator.languages,
            }}
          />
        </AppErrorBoundary>
      </AppContext.Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
