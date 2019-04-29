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
    } = parseParams(window.location.hash);

    const {
      code,
    } = parseParams(window.location.search);

    console.log('query code', code);

    [
      actions.setProductId(productId),
      actions.setCode(code),
      actions.fetchPkce(),
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
