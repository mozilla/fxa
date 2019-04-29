import React from 'react';
import { render } from 'react-dom';
import { createAppStore, actions } from './store';
import { parseParams } from './utils';

import config from './config';
import './styles/index.css';
import App from './components/App';

function init() {
  const store = createAppStore();
  const { dispatch } = store;

  const updateFromParams = () => {
    const {
      productId,
      accessToken
    } = parseParams(window.location.hash);
    [
      actions.setProductId(productId),
      actions.setAccessToken(accessToken),
      actions.fetchProfile(accessToken),
      actions.fetchToken(accessToken),
      actions.fetchPlans(accessToken),
      actions.fetchSubscriptions(accessToken)
    ].map(dispatch);
  };

  render(
    <App {...{ store, config, updateFromParams }} />,
    document.getElementById('main-content')
  );
  window.addEventListener('popstate', updateFromParams);
  updateFromParams();
}

init();
