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
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { GET_LOCAL_SIGNED_IN_STATUS } from './app-gql';
import * as Sentry from '@sentry/browser';

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

const isUnauthorizedError = (error: GraphQLError | GraphQLFormattedError) => {
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
const isUnverifiedSessionError = (
  error: GraphQLError | GraphQLFormattedError
) => {
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

export const errorHandler: ErrorHandler = ({
  graphQLErrors,
  networkError,
  operation,
}) => {
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

          // Note, we relay the search query, so that RP can control the signin flow.
          // For example an RP could link to https://accounts.firefox.com/settings?email=foo@mozilla.com
          // in order to force a user to signin as foo@mozilla.com.
          return window.location.replace(`/signin${window.location.search}`);
        } else {
          // If the user isn't in Settings and they see this message they may hit it due to
          // the initial metrics query - e.g. if they attempt to sign in and see the TOTP page,
          // they'll be in this state.
          cache.writeQuery({
            query: GET_LOCAL_SIGNED_IN_STATUS,
            data: { isSignedIn: false },
          });
        }
      } else {
        // Add error as bread crumb, so if there's a down stream exception, we can
        // see potential gql problems.
        Sentry.addBreadcrumb({
          category: 'graphql.error',
          message: error.message,
          level: 'error',
          data: {
            operation: operation.operationName,
            graphQLError: error,
          },
        });
      }
    }
  }

  if (networkError) {
    Sentry.captureException(networkError, {
      extra: {
        operation: operation.operationName,
      },
    });
  }
};

const sentryLink = new ApolloLink((operation, forward) => {
  const { operationName, variables } = operation;

  return forward(operation).map((response) => {
    // Log the response
    Sentry.addBreadcrumb({
      category: 'graphql.response',
      message: operationName || 'Unnamed operation',
      level: 'info',
      data: {
        request: {
          variables,
        },
      },
    });

    return response;
  });
});

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
        // Important! When calling next with fabricated data, we must make sure that required fields
        // are present. Otherwise, we will get the following error:
        //     https://www.apollographql.com/docs/react/errors#%7B%22version%22%3A%223.11.1%22%2C%22message%22%3A12%2C%22args%22%3A%5B%22account%22%2C%22%7B%7D%22%5D%7D
        //
        // The fact we can't resolve a session token, also means that we can't resolve the current account info. There fore setting the
        // the account: null here seems like the right thing to do, and also avoids any errors writing to the current cache state.
        observer.next({ data: { account: null } });
        observer.complete();
      });
    }
    return forward(operation);
  });

  // errorLink handles error responses from the server
  const errorLink = onError(errorHandler);

  const apolloClientConfig = {
    cache,
    link: from([
      errorLink,
      sentryLink,
      sessionTokenCheckLink,
      authLink,
      afterwareLink,
      httpLink,
    ]),
    typeDefs,
    connectToDevTools: window.location.host === 'localhost:3030',
    devtools: {
      enabled: window.location.host === 'localhost:3030',
      name: window.location.host === 'localhost:3030' ? 'settings' : '',
    },
  };
  apolloClientInstance = new ApolloClient(apolloClientConfig);

  return apolloClientInstance;
}
