import React, { useContext } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import * as Sentry from '@sentry/browser';

import { QueryParams } from './lib/types';
import { Config } from './lib/config';
import { getErrorMessage } from './lib/errors';
import { Store } from './store/types';
import { AppContext, AppContextType } from './lib/AppContext';

import './App.scss';
import DialogMessage from './components/DialogMessage';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import ScreenInfo from './lib/screen-info';
import { LoadingOverlay } from './components/LoadingOverlay';
import * as FlowEvents from './lib/flow-event';

const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

// TODO: Come up with a better fallback component for lazy-loaded routes
const RouteFallback = () => <LoadingOverlay isLoading={true} />;

type AppProps = {
  config: Config;
  store: Store;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: () => void;
};

export const App = ({
  config,
  store,
  queryParams,
  matchMedia,
  navigateToUrl,
  getScreenInfo,
  locationReload,
}: AppProps) => {
  const appContextValue: AppContextType = {
    config,
    queryParams,
    matchMedia,
    navigateToUrl,
    getScreenInfo,
    locationReload,
  };
  FlowEvents.init(queryParams);
  return (
    <AppContext.Provider value={appContextValue}>
      <AppErrorBoundary>
        <StripeProvider apiKey={config.stripe.apiKey}>
          <ReduxProvider store={store}>
            <Router>
              <React.Suspense fallback={<RouteFallback />}>
                {/* Note: every Route below should also be listed in INDEX_ROUTES in server/lib/server.js */}
                <Route
                  path="/"
                  exact
                  render={() => <Redirect to="/subscriptions" />}
                />
                <Route
                  path="/subscriptions"
                  exact
                  render={props => (
                    <SettingsLayout>
                      <Subscriptions {...props} />
                    </SettingsLayout>
                  )}
                />
                <Route
                  path="/products/:productId"
                  render={props => (
                    <SignInLayout>
                      <Product {...props} />
                    </SignInLayout>
                  )}
                />
              </React.Suspense>
            </Router>
          </ReduxProvider>
        </StripeProvider>
      </AppErrorBoundary>
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
    Sentry.captureException(error);
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
  const displayMessage = getErrorMessage('api_connection_error');
  return (
    <SettingsLayout>
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-loading-app">General application error</h4>
        <p>{displayMessage}</p>
      </DialogMessage>
    </SettingsLayout>
  );
};

export default App;
