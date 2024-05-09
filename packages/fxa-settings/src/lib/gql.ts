/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ApolloClient,
  ApolloLink,
  NormalizedCacheObject,
  Observable,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorHandler, onError } from '@apollo/client/link/error';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { cache, sessionToken, typeDefs } from './cache';
import { GraphQLError } from 'graphql';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../components/App/gql';
import sentryMetrics from 'fxa-shared/sentry/browser';

/**
 * These operation names either require auth with a valid session token
 * or give back a valid session token (e.g. the user was signed in).
 * See comment above GET_LOCAL_SIGNED_IN_STATUS definition.
 *
 */
const initialOperationName = 'GetInitialMetricsState';
const sessionTokenOperationNames = [
  initialOperationName,
  'GetInitialSettingsState',
  'SignUp',
  'SignIn',
];

const isUnauthorizedError = (error: GraphQLError) => {
  const { originalError } = error.extensions as {
    originalError?: { error?: string };
  };
  return (
    error.message === 'Invalid token' && originalError?.error === 'Unauthorized'
  );
};

/**
 * This error is returned when the session is unverified, i.e. the user has
 * not verified the login via email/2FA. Note, the email can be verified but not the
 * session. Only certain queries/API calls require a verified session.
 *
 * @param error
 */
const isUnverifiedSessionError = (error: GraphQLError) => {
  return error.message === 'Must verify';
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
      } else if (isUnverifiedSessionError(error)) {
        if (window.location && window.location.pathname.includes('settings')) {
          // Redirect to /signin since that page will send the user
          // to correct location
          return window.location.replace(`/signin?action=email&service=sync`);
        } else if (
          window.location &&
          window.location.pathname.includes('signin_token_code')
        ) {
          // If the user is already on the signin_token_code page, we don't need to redirect
          debugger;
        } else {
          // If the user isn't in Settings and they see this message they may hit it due to
          // the initial metrics query - e.g. if they attempt to sign in and see the TOTP page,
          // they'll be in this state.
          cache.writeQuery({
            query: GET_LOCAL_SIGNED_IN_STATUS,
            data: { isSignedIn: false },
          });
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

  // Set `isSignedIn` status and cancel the network request for
  // the initial GQL query that needs a session token
  const sessionTokenCheckLink = new ApolloLink((operation, forward) => {
    if (!sessionToken() && operation.operationName === initialOperationName) {
      cache.writeQuery({
        query: GET_LOCAL_SIGNED_IN_STATUS,
        data: { isSignedIn: false },
      });
      return new Observable((observer) => {
        observer.next({ data: {} });
        observer.complete();
      });
    }
    return forward(operation);
  });

  // errorLink handles error responses from the server
  const errorLink = onError(errorHandler);

  apolloClientInstance = new ApolloClient({
    cache,
    link: from([
      errorLink,
      sessionTokenCheckLink,
      authLink,
      afterwareLink,
      httpLink,
    ]),
    typeDefs,
  });

  return apolloClientInstance;
}
