import React, { ReactNode, useContext } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { StripeProvider } from 'react-stripe-elements';
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  Redirect,
  Switch,
  useRouteMatch,
} from 'react-router-dom';
import { Localized } from '@fluent/react';
import DocumentTitle from 'react-document-title';

import AppLocalizationProvider from './lib/AppLocalizationProvider';
import sentryMetrics from './lib/sentry';
import { QueryParams } from './lib/types';
import { Config, config } from './lib/config';
import { getErrorMessage } from './lib/errors';
import { Store } from './store';
import { AppContext, AppContextType } from './lib/AppContext';

import DialogMessage from './components/DialogMessage';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import ScreenInfo from './lib/screen-info';
import { LoadingOverlay } from './components/LoadingOverlay';
import * as FlowEvents from './lib/flow-event';
import { observeNavigationTiming } from './lib/navigation-timing';

const Product = React.lazy(() => import('./routes/Product'));
const ProductV2 = React.lazy(() => import('./routes/ProductV2'));
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

export const App = ({
  config,
  store,
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

  const { useSCAPaymentUIByDefault = false } = config.featureFlags;

  const appContextValue: AppContextType = {
    config,
    queryParams,
    matchMedia,
    matchMediaDefault,
    navigateToUrl,
    getScreenInfo,
    locationReload,
    navigatorLanguages,
    stripePromise,
  };
  FlowEvents.init(queryParams);
  observeNavigationTiming('/navigation-timing');

  return (
    <AppContext.Provider value={appContextValue}>
      <AppLocalizationProvider
        userLocales={navigatorLanguages}
        bundles={['main']}
      >
        <Localized id="document" attrs={{ title: true }}>
          <DocumentTitle title="Firefox Accounts">
            <AppErrorBoundary>
              <StripeProvider apiKey={config.stripe.apiKey}>
                <ReduxProvider store={store}>
                  <Router>
                    <React.Suspense fallback={<RouteFallback />}>
                      <Switch>
                        {/* Note: every permutation of Route and nested Routes below should also be listed in INDEX_ROUTES in server/lib/server.js */}
                        <Route path="/" exact>
                          <Redirect to="/subscriptions" />
                        </Route>
                        {/* TODO: FXA-2275 - remove V1 routes, only use V2 after SCA UI stabilizes */}
                        <Route path="/v1">
                          <AppRoutesV1 />
                        </Route>
                        <Route path="/v2">
                          <AppRoutesV2 />
                        </Route>
                        <Route>
                          {useSCAPaymentUIByDefault ? (
                            <AppRoutesV2 />
                          ) : (
                            <AppRoutesV1 />
                          )}
                        </Route>
                      </Switch>
                    </React.Suspense>
                  </Router>
                </ReduxProvider>
              </StripeProvider>
            </AppErrorBoundary>
          </DocumentTitle>
        </Localized>
      </AppLocalizationProvider>
    </AppContext.Provider>
  );
};

const joinPath = (path: string, ...rest: string[]) =>
  [path === '/' ? '' : path, ...rest].join('/');

// Legacy "V1" routes before introduction of SCA payment methods
const AppRoutesV1 = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        path={joinPath(path, 'subscriptions')}
        exact
        render={(props) => (
          <SettingsLayout>
            <Subscriptions {...props} />
          </SettingsLayout>
        )}
      />
      <Route
        path={joinPath(path, 'products/:productId')}
        render={(props) => (
          <SignInLayout>
            <Product {...props} />
          </SignInLayout>
        )}
      />
    </Switch>
  );
};

// New "V2" routes implementing SCA payment methods
const AppRoutesV2 = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        path={joinPath(path, 'subscriptions')}
        exact
        render={(props) => (
          <SettingsLayout>
            <Subscriptions {...props} />
          </SettingsLayout>
        )}
      />
      <Route
        path={joinPath(path, 'products/:productId')}
        render={(props) => (
          <SignInLayout>
            <ProductV2 {...props} />
          </SignInLayout>
        )}
      />
    </Switch>
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
  // TODO: Not displaying the actual error message to the user, just logging it.
  // Most of these errors will probably be failure to load Stripe widgets.
  return (
    <SettingsLayout>
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <Localized id="general-error-heading">
          <h4 data-testid="error-loading-app">General application error</h4>
        </Localized>
        <Localized id={getErrorMessage('api_connection_error')}>
          <p>Something went wrong. Please try again later.</p>
        </Localized>
      </DialogMessage>
    </SettingsLayout>
  );
};

export default App;
