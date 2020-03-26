/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import { config, readConfigFromMeta } from './lib/config';
import App from './App';
import './index.scss';

readConfigFromMeta(headQuerySelector);

const client = new ApolloClient({
  uri: `${config.servers.admin.url}/graphql`,
});

ReactDOM.render(
  <ApolloProvider {...{ client }}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

function headQuerySelector(name: string) {
  return document.head.querySelector(name);
}
