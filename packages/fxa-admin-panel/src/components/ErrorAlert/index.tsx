/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import React from 'react';

export type NetworkError = ApolloError['networkError'];

// Type guards - If the `networkError` is a `ServerError`, we want to display its `result.errors`
// array containing extra info
function isNetworkServerError(
  networkError: NetworkError
): networkError is ServerError {
  return (networkError as ServerError)?.result !== undefined;
}

// If the `networkError` is a `ServerParseError`, we want to display `bodyText` and `statusCode`
function isNetworkServerParseError(
  networkError: NetworkError
): networkError is ServerParseError {
  return (
    (networkError as ServerParseError)?.bodyText !== undefined &&
    (networkError as ServerParseError)?.statusCode !== undefined
  );
}

// This alert dialog is based on the experimenter alert dialog
// Ref: https://github.com/mozilla/experimenter/blob/main/app/experimenter/nimbus-ui/src/components/ApolloErrorAlert/index.tsx
export const ErrorAlert = ({ error }: { error: any }) => {
  const { graphQLErrors = [], networkError } = error as ApolloError;
  const networkServerErrors =
    networkError && isNetworkServerError(networkError)
      ? typeof networkError.result === 'string'
        ? [networkError.result]
        : networkError.result.errors
      : [];

  let heading = 'General GQL Error';
  if (graphQLErrors.length) {
    heading = 'GraphQL Apollo Error';
  } else if (networkError) {
    heading = 'Network Error';
  }

  return (
    <div
      className="border border-red-400 text-red-700 px-4 py-3 my-4 rounded relative"
      role="alert"
      data-testid="error-alert"
    >
      <div className="font-bold py-2">{heading}</div>
      <p className="mb-6 pt-2">Something went wrong. Please try again later.</p>
      <hr />
      {error.message && (
        <p>
          <b>Message:</b> {error.message}
        </p>
      )}
      {graphQLErrors.length > 0 &&
        graphQLErrors.map((gqlError: GraphQLError | GraphQLFormattedError) => (
          <p key={gqlError.message}>
            <b>graphQL error:</b> {gqlError.message}
          </p>
        ))}
      {networkServerErrors.length > 0 &&
        networkServerErrors.map((serverError: ServerError) => (
          <p key={serverError.message}>
            <b>Network error:</b> {serverError.message}
          </p>
        ))}
      {networkError && isNetworkServerParseError(networkError) && (
        <>
          <p>
            <b>Status code:</b> {networkError.statusCode}
          </p>
          <p>
            <b>Body text:</b> {networkError.bodyText}
          </p>
        </>
      )}
    </div>
  );
};

export default ErrorAlert;
