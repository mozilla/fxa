import React, { useContext } from 'react';
import { StripeProvider } from 'react-stripe-elements';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  RouteComponentProps,
} from 'react-router-dom';

import SentryMetrics from './lib/sentry';
import { QueryParams } from './lib/types';
import { Config, config } from './lib/config';
import { getErrorMessage, AuthServerErrno } from './lib/errors';
import { AppContext, AppContextType } from './lib/AppContext';

import './App.scss';
import DialogMessage from './components/DialogMessage';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import ScreenInfo from './lib/screen-info';
import { LoadingOverlay } from './components/LoadingOverlay';
import * as FlowEvents from './lib/flow-event';

import {
  apiFetchPlans,
  apiFetchProfile,
  apiFetchCustomer,
  apiFetchSubscriptions,
  apiFetchToken,
} from './lib/apiClient';

import { useAwait } from './lib/hooks';

import ErrorDialogMessage from './components/ErrorDialogMessage';
import { StaticContext } from 'react-router';

const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

// TODO: Come up with a better fallback component for lazy-loaded routes
const RouteFallback = () => <LoadingOverlay isLoading={true} />;

const sentryMetrics = new SentryMetrics(config.sentry.dsn);

export type AppProps = {
  config: Config;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: () => void;
};

export const App = ({
  config,
  queryParams,
  matchMedia,
  navigateToUrl,
  getScreenInfo,
  locationReload,
}: AppProps) => {
  FlowEvents.init(queryParams);

  const [token] = useAwait(apiFetchToken);
  const [plans] = useAwait(apiFetchPlans);
  const [profile] = useAwait(apiFetchProfile);
  const [customer, fetchCustomer] = useAwait(apiFetchCustomer);
  const [subscriptions, fetchSubscriptions] = useAwait(apiFetchSubscriptions);

  if (
    subscriptions.pending ||
    customer.pending ||
    plans.pending ||
    profile.pending
  ) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!plans.result || plans.error) {
    return (
      <ErrorDialogMessage
        testid="error-loading-plans"
        title="Problem loading plans"
        error={plans.error}
        onDismiss={locationReload}
      />
    );
  }

  if (!profile.result || profile.error) {
    return (
      <ErrorDialogMessage
        testid="error-loading-profile"
        title="Problem loading profile"
        error={profile.error}
        onDismiss={locationReload}
      />
    );
  }

  if (!subscriptions.result || subscriptions.error) {
    return (
      <ErrorDialogMessage
        testid="error-subscriptions-fetch"
        title="Problem loading subscriptions"
        error={subscriptions.error}
        onDismiss={locationReload}
      />
    );
  }

  if (
    customer.error &&
    // Unknown customer just means the user hasn't subscribed to anything yet
    customer.error.errno !== AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER
  ) {
    return (
      <ErrorDialogMessage
        testid="error-loading-customer"
        title="Problem loading customer"
        error={customer.error}
        onDismiss={locationReload}
      />
    );
  }

  const appContextValue: AppContextType = {
    config,
    queryParams,
    matchMedia,
    navigateToUrl,
    getScreenInfo,
    locationReload,
    token: token.result,
    plans: plans.result,
    profile: profile.result,
    customer: customer.result,
    subscriptions: subscriptions.result,
    fetchCustomer,
    fetchSubscriptions,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <AppErrorBoundary>
        <StripeProvider apiKey={config.stripe.apiKey}>
          <Router>
            <React.Suspense fallback={<RouteFallback />}>
              {/* Note: every Route below should also be listed in INDEX_ROUTES in server/lib/server.js */}
              <Route path="/" exact render={subscriptionsRedirect} />
              <Route path="/subscriptions" exact render={subscriptionsRoute} />
              <Route path="/products/:productId" render={productRoute} />
            </React.Suspense>
          </Router>
        </StripeProvider>
      </AppErrorBoundary>
    </AppContext.Provider>
  );
};

export const subscriptionsRedirect = () => <Redirect to="/subscriptions" />;

export const subscriptionsRoute = (
  props: RouteComponentProps<any, StaticContext, any>
) => (
  <SettingsLayout>
    <Subscriptions {...props} />
  </SettingsLayout>
);

export const productRoute = (
  props: RouteComponentProps<any, StaticContext, any>
) => (
  <SignInLayout>
    <Product {...props} />
  </SignInLayout>
);

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
