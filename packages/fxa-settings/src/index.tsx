/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @ts-ignore
import './styles/tailwind.out.css';

import { createRoot } from 'react-dom/client';
import sentryMetrics from 'fxa-shared/sentry/browser';
import { AppErrorBoundary } from './components/ErrorBoundaries';
import App from './components/App';
import { NimbusProvider } from './models/contexts/NimbusContext';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { AppContext, initializeAppContext } from './models';
import { ThemeProvider } from './models/contexts/ThemeContext';
import Storage from './lib/storage';
import { restorePairingAttribution } from './lib/pairing-attribution';
import CookiesDisabled from './pages/CookiesDisabled';
import { BrowserRouter } from 'react-router';
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
  // FXA-14132: Fx Desktop opens the pairing-authority page with none of the
  // attribution params it gave /pair. Restore them from the hand-off stash before
  // the router — and every UrlQueryData — reads the URL. Mirrors
  // public/query-fix.js. No-op on every other route.
  restorePairingAttribution();

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

  const localStorageEnabled = Storage.isLocalStorageEnabled(window);

  // Redirect before rendering rather than during it. A concurrent root commits
  // asynchronously, so a render-phase navigation races the commit and can tear
  // the page down before CookiesDisabled ever paints. The pathname check keeps
  // a browser with genuinely disabled storage from replacing onto this route in
  // a loop.
  if (
    !localStorageEnabled &&
    window.location.pathname !== '/cookies_disabled'
  ) {
    window.location.replace('/cookies_disabled');
  }

  const View = localStorageEnabled
    ? () => <App {...{ flowQueryParams }} />
    : () => <CookiesDisabled />;

  const root = createRoot(document.getElementById('root') as HTMLElement);
  // TODO: re-enable strict mode in FXA-14313
  root.render(
    <BrowserRouter>
      <DynamicLocalizationProvider baseDir={config.l10n.baseUrl}>
        <AppErrorBoundary>
          <AppContext.Provider value={appContext}>
            <NimbusProvider>
              <ThemeProvider enabled={config.darkMode?.enabled}>
                <View />
              </ThemeProvider>
            </NimbusProvider>
          </AppContext.Provider>
        </AppErrorBoundary>
      </DynamicLocalizationProvider>
    </BrowserRouter>
  );
} catch (error) {
  console.error('Error initializing FXA Settings', error);
}
