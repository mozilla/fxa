/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppErrorBoundary from 'fxa-react/components/AppErrorBoundary';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { initSentry } from '@fxa/shared/sentry-browser';
import { config, readConfigFromMeta } from './lib/config';
import App from './App';
import './styles/tailwind.out.css';

try {
  // Watch out! This mutates the config. Make sure it gets run first!
  readConfigFromMeta(headQuerySelector);

  initSentry(
    {
      release: config.version,
      sentry: {
        ...config.sentry,
      },
    },
    console
  );

  const root = createRoot(document.getElementById('root')!);

  root.render(
    // TODO - Add StrictMode - We need to figure out
    //        why strict mode now appears to be breaking queries.
    // <React.StrictMode>
    <AppErrorBoundary>
      <AppLocalizationProvider>
        <App {...{ config }} />
      </AppLocalizationProvider>
    </AppErrorBoundary>
    // </React.StrictMode>
  );
} catch (error) {
  console.error('Error initializing fxa-admin-panel', error);
}

function headQuerySelector(name: string) {
  return document.head.querySelector(name);
}
