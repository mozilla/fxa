/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import sentryMetrics from 'fxa-shared/lib/sentry';
import App from './components/App';
import config from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import './styles/tailwind.out.css';

try {
  const appContext = initializeAppContext();

  sentryMetrics.configure({
    release: config.version,
    sentry: {
      ...config.sentry,
    },
  });

  const flowQueryParams = searchParams(
    window.location.search
  ) as FlowQueryParams;

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
