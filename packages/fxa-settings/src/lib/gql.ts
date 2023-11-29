/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ApolloClient,
  ApolloLink,
  NormalizedCacheObject,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorHandler, onError } from '@apollo/client/link/error';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { cache, sessionToken, typeDefs } from './cache';
import { GraphQLError } from 'graphql';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../components/App/gql';
import sentryMetrics from 'fxa-shared/lib/sentry';

/**
 * These operation names either require auth with a valid session token
 * or give back a valid session token (e.g. the user was signed in).
 * See comment above GET_LOCAL_SIGNED_IN_STATUS definition.
 *
 * We can improve or revisit this in FXA-7626 or FXA-7184.
 */
const sessionTokenOperationNames = [
  'GetInitialMetricsState',
  'GetInitialSettingsState',
  'SignUp',
];

const isUnauthorizedError = (error: GraphQLError) => {
  const { originalError } = error.extensions as {
    originalError?: { error?: string };
  };
  return (
    error.message === 'Invalid token' && originalError?.error === 'Unauthorized'
  );
};

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    // The error link handles GQL errors and network errors. This handles
    // successful queries and checks to see if we should update the `isSignedIn` state.
    const successWithAuth =
      !response.errors &&
      operation.query.definitions.some((definition) => {
        return (
          definition.kind === 'OperationDefinition' &&
          definition.name?.value &&
          sessionTokenOperationNames.includes(definition.name.value)
        );
      });

    if (successWithAuth) {
      cache.writeQuery({
        query: GET_LOCAL_SIGNED_IN_STATUS,
        data: { isSignedIn: true },
      });
    }
    return response;
  });
});

export const errorHandler: ErrorHandler = ({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (isUnauthorizedError(error)) {
        cache.writeQuery({
          query: GET_LOCAL_SIGNED_IN_STATUS,
          data: { isSignedIn: false },
        });
        // TODO: Improve in FXA-7626
      } else if (error.message === 'Must verify') {
        // TODO in FXA-76726
        // Move this redirect behaviour to only apply to Settings context,
        // we do not want to redirect for other contexts (such as Signup or Reset password)
        if (window.location && window.location.pathname.includes('settings')) {
          return window.location.replace(
            `/signin_token_code?action=email&service=sync`
          );
        }
      }
    }
    console.error('graphQLErrors', graphQLErrors);
  }
  if (networkError) {
    sentryMetrics.captureException(networkError);
    console.error('networkError', networkError);
  }
};

let apolloClientInstance: ApolloClient<NormalizedCacheObject>;
export function createApolloClient(gqlServerUri: string) {
  if (apolloClientInstance) {
    return apolloClientInstance;
  }

  // httpLink makes the actual requests to the server
  const httpLink = new BatchHttpLink({
    uri: `${gqlServerUri}/graphql`,
  });

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

  apolloClientInstance = new ApolloClient({
    cache,
    link: from([errorLink, authLink, afterwareLink, httpLink]),
    typeDefs,
  });

  return apolloClientInstance;
}
