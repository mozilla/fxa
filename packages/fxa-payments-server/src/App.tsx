/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useContext } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { StripeProvider } from 'react-stripe-elements';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Localized } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import sentryMetrics from './lib/sentry';
import { QueryParams } from './lib/types';
import { Config } from './lib/config';
import { getErrorMessage } from './lib/errors';
import { Store } from './store';
import { AppContext, AppContextType } from './lib/AppContext';

import DialogMessage from './components/DialogMessage';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import ScreenInfo from './lib/screen-info';
import { LoadingOverlay } from './components/LoadingOverlay';
import * as FlowEvents from './lib/flow-event';
import { observeNavigationTiming } from 'fxa-shared/metrics/navigation-timing';
import selectors from './store/selectors';

const Checkout = React.lazy(() => import('./routes/Checkout'));
const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

// TODO: Come up with a better fallback component for lazy-loaded routes?
const RouteFallback = () => <LoadingOverlay isLoading={true} />;

// TODO: Would like to find a better type here describing a function that
// returns a wrapper component that provides a MemoryRouter with
// initialEntries set. But, doing this for now.
type RouterOverride = () => (props: { children: ReactNode }) => JSX.Element;

export type AppProps = {
  config: Config;
  store: Store;
  accessToken: string | null;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  matchMediaDefault: (query: string) => MediaQueryList;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: () => void;
  navigatorLanguages: readonly string[];
  stripePromise: ReturnType<typeof loadStripe>;
  routerOverride?: RouterOverride;
};

export function enableNavTiming(store: Store) {
  let unsubscribe: ReturnType<typeof store.subscribe>;
  const metricsObs = () => {
    const profile = selectors.profile(store.getState());
    // explicitly check for `false` because `undefined` means
    // the user doesn't have an account or isn't signed in
    if (profile?.result && profile.result.metricsEnabled !== false) {
      observeNavigationTiming('/navigation-timing');
      unsubscribe?.();
    }
  };
  unsubscribe = store.subscribe(metricsObs);
}

export const App = ({
  config,
  store,
  accessToken,
  queryParams,
  matchMedia,
  matchMediaDefault,
  navigateToUrl,
  getScreenInfo,
  locationReload,
  navigatorLanguages,
  stripePromise,
  routerOverride,
}: AppProps) => {
  /* istanbul ignore next - router override is only used for tests */
  const Router = routerOverride ? routerOverride() : BrowserRouter;

  const appContextValue: AppContextType = {
    config,
    queryParams,
    accessToken,
    matchMedia,
    matchMediaDefault,
    navigateToUrl,
    getScreenInfo,
    locationReload,
    navigatorLanguages,
    stripePromise,
  };
  FlowEvents.init(queryParams);
  enableNavTiming(store);

  return (
    <AppContext.Provider value={appContextValue}>
      <Head />
      <AppLocalizationProvider
        userLocales={navigatorLanguages}
        bundles={['main']}
      >
        <Localized id="document" attrs={{ title: true }}>
          <AppErrorBoundary>
            <StripeProvider apiKey={config.stripe.apiKey}>
              <ReduxProvider store={store}>
                <React.Suspense fallback={<RouteFallback />}>
                  <Router>
                    <Routes>
                      {/* Note: every permutation of Route and nested Routes below should also be listed in INDEX_ROUTES in server/lib/server.js */}
                      <Route
                        path="/"
                        element={<Navigate to="/subscriptions" />}
                      />
                      <Route
                        path="/subscriptions"
                        element={
                          <SettingsLayout>
                            <Subscriptions />
                          </SettingsLayout>
                        }
                      />
                      <Route
                        path="/products/:productId"
                        element={
                          <SignInLayout>
                            <Product />
                          </SignInLayout>
                        }
                      />
                      <Route
                        path="/checkout/:productId"
                        element={
                          <SignInLayout>
                            <Checkout />
                          </SignInLayout>
                        }
                      />
                    </Routes>
                  </Router>
                </React.Suspense>
              </ReduxProvider>
            </StripeProvider>
          </AppErrorBoundary>
        </Localized>
      </AppLocalizationProvider>
    </AppContext.Provider>
  );
};

export class AppErrorBoundary extends React.Component {
  state: {
    error: undefined | Error;
  };
  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AppError', error);
    sentryMetrics.captureException(error);
  }
  render() {
    const { error } = this.state;
    return error ? <AppErrorDialog error={error} /> : this.props.children;
  }
}

export const AppErrorDialog = ({ error: { message } }: { error: Error }) => {
  const { locationReload } = useContext(AppContext);
  const ariaLabelledBy = "general-application-error-header";
  const ariaDescribedBy = "general-application-error-description";
  // TODO: Not displaying the actual error message to the user, just logging it.
  // Most of these errors will probably be failure to load Stripe widgets.
  return (
    <SettingsLayout>
      <DialogMessage
        className="dialog-error"
        onDismiss={locationReload}
        headerId={ariaLabelledBy}
        descId={ariaDescribedBy}
      >
        <Localized id="general-error-heading">
          <h4 id={ariaLabelledBy} data-testid="error-loading-app">General application error</h4>
        </Localized>
        <Localized id={getErrorMessage({ code: 'api_connection_error' })}>
          <p id={ariaDescribedBy}> Something went wrong. Please try again later.</p>
        </Localized>
      </DialogMessage>
    </SettingsLayout>
  );
};

export default App;
