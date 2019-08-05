import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import { Config, QueryParams } from './lib/types';
import { AppContext, AppContextType } from './lib/AppContext';

import './App.scss';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import ScreenInfo from './lib/screen-info';
import { LoadingOverlay } from './components/LoadingOverlay';

const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

// TODO: Come up with a better fallback component for lazy-loaded routes
const RouteFallback = () => <LoadingOverlay isLoading={true} />;

type AppProps = {
  accessToken: string;
  config: Config;
  store: Store;
  queryParams: QueryParams;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: () => void;
};

export const App = ({
  accessToken,
  config,
  store,
  queryParams,
  navigateToUrl,
  getScreenInfo,
  locationReload,
}: AppProps) => {
  const appContextValue: AppContextType = {
    accessToken,
    config,
    queryParams,
    navigateToUrl,
    getScreenInfo,
    locationReload,
  };
  return (
    <StripeProvider apiKey={config.stripe.apiKey}>
      <Provider store={store}>
        <AppContext.Provider value={appContextValue}>
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
        </AppContext.Provider>
      </Provider>
    </StripeProvider>
  );
};

export default App;
