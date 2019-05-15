import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Config } from './lib/types';

import './App.scss';
import LoadingSpinner from './components/LoadingSpinner';
import Profile from './components/Profile';

const Home = React.lazy(() => import('./routes/Home'));
const Product = React.lazy(() => import('./routes/Product'));
const Subscriptions = React.lazy(() => import('./routes/Subscriptions'));

type AppProps = {
  accessToken: string,
  config: Config,
  store: Store,
};

export const App = ({ 
  accessToken,
  config,
  store
}: AppProps) => {
  // TODO: This HOC could be better annotated with types
  // eslint-disable-next-line react/display-name
  const commonRender =
    (Component: any) =>
      (props: object) =>
        <Component {...{ accessToken, config, ...props }} />;

  return (
    <StripeProvider apiKey={config.STRIPE_API_KEY}>
      <Provider store={store}>
        <Router>
          <Profile />
          <a href={`${config.CONTENT_SERVER_ROOT}/settings`}>&#x2039; Back to FxA Settings</a><br />
          <Link to="/">&#x2039; Back to index</Link>

          <div className="app">
            <React.Suspense fallback={<LoadingSpinner />}>
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
