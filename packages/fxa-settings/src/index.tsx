/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider, ApolloClient, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import App from './components/App';
import {AuthClient, AuthContext} from './components/Auth';
import sentryMetrics from 'fxa-shared/lib/sentry';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/utilities';
import { cache, getSessionToken, typeDefs } from './lib/cache'
import './index.scss';

try {
  sentryMetrics.configure(config.sentry.dsn, config.version);
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  if (!config.servers.gql.url) {
    throw new Error('GraphQL API URL not set');
  }
  if (!config.servers.auth.url) {
    throw new Error('Auth Server URL not set');
  }
  const authClient = new AuthClient(config.servers.auth.url)

  // sessionToken can change due to a password change so we
  // can't simply add it in the constructor
  const httpLink = createHttpLink({
    uri: `${config.servers.gql.url}/graphql`,
  });
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: getSessionToken(),
      }
    }
  });

  // TODO: due to the nature and specificity of the requests we need to talk
  // directly to the auth server, not the GQL server, for the following routes:
  // - POST /password/change/start
  // - POST /password/change/finish
  // - POST /account/destroy
  const apolloClient = new ApolloClient({
    cache,
    link: authLink.concat(httpLink),
    typeDefs
  });
  const queryParams = searchParams(window.location.search);

  render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <AuthContext.Provider value={{client: authClient}}>
          <App {...{ queryParams }} />
        </AuthContext.Provider>
      </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.log('Error initializing FXA Settings', error);
}
