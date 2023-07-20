/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import App from './components/App';
import { readConfigMeta } from './lib/config';
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
  showReactApp?: string;
  isInRecoveryKeyExperiment?: string;
}

try {
  const flowQueryParams = searchParams(window.location.search) as QueryParams;

  // Populate config
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  const appContext = initializeAppContext();

  render(
    <React.StrictMode>
      <AppErrorBoundary>
        <AppContext.Provider value={appContext}>
          <AppLocalizationProvider
            baseDir="/settings/locales"
            userLocales={navigator.languages}
          >
            <App {...{ flowQueryParams }} />
          </AppLocalizationProvider>
        </AppContext.Provider>
      </AppErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
