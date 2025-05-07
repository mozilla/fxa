/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { errorHandler } from './gql';
import { ErrorResponse } from '@apollo/client/link/error';
import { Operation, NextLink, ServerError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import { cache } from './cache';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../components/App/gql';
import * as Sentry from '@sentry/browser';

describe('errorHandler', () => {
  beforeAll(() => {
    // We don't verify that console.error gets called, but mocking it out
    // avoids console noise filling up the command line as the tests run.
    console.error = jest.fn();
  });

  it('updates local signed in status if called with a GQL authentication error', () => {
    const writeQueryMock = jest.fn();
    jest.spyOn(cache, 'writeQuery').mockImplementation(writeQueryMock);

    const errorResponse: ErrorResponse = {
      graphQLErrors: [
        new GraphQLError('Invalid token', null, null, null, null, null, {
          originalError: { error: 'Unauthorized' },
        }),
      ],
      operation: {
        operationName: 'foo',
      } as Operation,
      forward: jest.fn(),
    };

    errorHandler(errorResponse);

    expect(writeQueryMock).toHaveBeenCalledWith({
      query: GET_LOCAL_SIGNED_IN_STATUS, // Replace with the actual query
      data: { isSignedIn: false },
    });
  });

  it('adds breadcrumb on graphql error', () => {
    const gqlError = new GraphQLError('Foo', null, null, null, null, null, {
      originalError: { error: 'Boom' },
    });
    const errorResponse: ErrorResponse = {
      graphQLErrors: [gqlError],
      operation: {
        operationName: 'Foo',
      } as Operation,
      forward: jest.fn(),
    };

    const addBreadcrumbMock = jest.fn();
    jest.spyOn(Sentry, 'addBreadcrumb').mockImplementation(addBreadcrumbMock);

    errorHandler(errorResponse);

    expect(addBreadcrumbMock).toHaveBeenCalledWith({
      category: 'graphql.error',
      message: 'Foo',
      level: 'error',
      data: {
        operation: 'Foo',
        graphQLError: gqlError,
      },
    });
  });

  it('logs network errors to Sentry', () => {
    let networkError: any;
    networkError = new Error('Network error') as ServerError;
    const errorResponse: ErrorResponse = {
      networkError,
      operation: {
        operationName: 'foo',
      } as any as Operation,
      forward: jest.fn() as NextLink,
    };
    const captureExceptionMock = jest.fn();
    jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(captureExceptionMock);

    errorHandler(errorResponse);

    expect(captureExceptionMock).toHaveBeenCalledWith(networkError, {
      extra: {
        operation: 'foo',
      },
    });
  });
});
