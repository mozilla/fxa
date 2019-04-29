import React from 'react';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { Route, BrowserRouter } from 'react-router-dom';

import './index.css';
import Home from '../Home';

export const App = ({ store, config }) => (
  <StripeProvider apiKey={config.STRIPE_API_KEY}>
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          <Route exact path="/"
            render={props => <Home {...props} config={config} />}/>
        </div>
      </BrowserRouter>
    </Provider>
  </StripeProvider>
);

export default App;
