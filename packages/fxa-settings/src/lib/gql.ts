/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorHandler, onError } from '@apollo/client/link/error';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { cache, sessionToken, typeDefs } from './cache';

const pagesViewableWithoutAuthentication = [
  'primary_email_verified',
  'primary_email_confirmed',
  'reset_password_verified',
  'reset_password_with_recovery_key_verified',
  'signup_verified',
  'signup_confirmed',
];

export const errorHandler: ErrorHandler = ({ graphQLErrors, networkError }) => {
  let reauth = false;

  const currentPageDoesNotRequireAuthentication =
    pagesViewableWithoutAuthentication.some((urlSnippet) => {
      // We check if the url for the current page contains the path of a page which does not require authentication
      return (
        window?.location?.href && window.location.href.includes(urlSnippet)
      );
    });

  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.message === 'Invalid token') {
        reauth = true;
      } else if (error.message === 'Must verify') {
        return window.location.replace(
          `/signin_token_code?action=email&service=sync`
        );
      }
    }
  }
  if (networkError && 'statusCode' in networkError) {
    if (networkError.statusCode === 401) {
      reauth = true;
    }
  }
  if (reauth && !currentPageDoesNotRequireAuthentication) {
    window.location.replace(
      `/signin?redirect_to=${encodeURIComponent(window.location.pathname)}`
    );
  } else {
    console.error('graphql errors', graphQLErrors, networkError);
  }
};

export function createApolloClient(gqlServerUri: string) {
  // httpLink makes the actual requests to the server
  const httpLink = new BatchHttpLink({
    uri: `${gqlServerUri}/graphql`,
  });

  // authLink sets the Authentication header on outgoing requests
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: 'Bearer ' + sessionToken(),
      },
    };
  });

  // errorLink handles error responses from the server
  const errorLink = onError(errorHandler);

  const apolloClient = new ApolloClient({
    cache,
    link: from([errorLink, authLink, httpLink]),
    typeDefs,
  });

  return apolloClient;
}
