import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Config, QueryParams } from './lib/types';

import './App.scss';
import LoadingOverlay from './components/LoadingOverlay';
import Profile from './components/Profile';

const Home = React.lazy(() => import('./routes/Home'));
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
  // TODO: This HOC could be better annotated with types
  // eslint-disable-next-line react/display-name
  const commonRender =
    (Component: any) =>
      (props: object) =>
        <Component {...{ accessToken, config, queryParams, ...props }} />;

  // Note: every Route below should also be listed in INDEX_ROUTES in server/lib/server.js
  return (
    <StripeProvider apiKey={config.STRIPE_API_KEY}>
      <Provider store={store}>
        <Router>
          <LoadingOverlay />
          <Profile />
          <a href={`${config.CONTENT_SERVER_ROOT}/settings`}>&#x2039; Back to FxA Settings</a><br />
          <Link to="/">&#x2039; Back to index</Link>

          <div className="app">
            <React.Suspense fallback={<RouteFallback />}>
              <Route path="/" exact render={commonRender(Home)} />
              <Route path="/subscriptions" exact render={commonRender(Subscriptions)} />
              <Route path="/products/:productId" render={commonRender(Product)} />
            </React.Suspense>
          </div>
        </Router>
      </Provider>
    </StripeProvider>
  );
};

export default App;
