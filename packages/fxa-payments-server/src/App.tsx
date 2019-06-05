import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import { Config, QueryParams } from './lib/types';

import './App.scss';
import { SignInLayout, SettingsLayout } from './components/AppLayout';
import LoadingOverlay from './components/LoadingOverlay';

const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

// TODO: Come up with a better fallback component for lazy-loaded routes
const RouteFallback = () => <p>Loading...</p>;

type AppProps = {
  accessToken: string,
  config: Config,
  store: Store,
  queryParams: QueryParams
};

export const App = ({
  accessToken,
  config,
  store,
  queryParams
}: AppProps) => {
  // Note: every Route below should also be listed in INDEX_ROUTES in server/lib/server.js
  return (
    <StripeProvider apiKey={config.STRIPE_API_KEY}>
      <Provider store={store}>
        <LoadingOverlay />
        <Router>
          <React.Suspense fallback={<RouteFallback />}>
            <Route path="/" exact render={() => ( <Redirect to="/subscriptions" /> )} />
            <Route path="/subscriptions" exact render={props => (
              <SettingsLayout>
                <Subscriptions {...{ accessToken, config, queryParams, ...props }} />
              </SettingsLayout>
            )} />
            <Route path="/products/:productId" render={props => (
              <SignInLayout>
                <Product {...{ accessToken, config, queryParams, ...props }} />
              </SignInLayout>
            )} />
          </React.Suspense>
        </Router>
      </Provider>
    </StripeProvider>
  );
};

export default App;
