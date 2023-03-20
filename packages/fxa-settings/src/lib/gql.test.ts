/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { errorHandler } from './gql';
import { ErrorResponse } from '@apollo/client/link/error';
import { Operation, NextLink, ServerError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import Mock = jest.Mock;

let errorResponse: ErrorResponse;
let mockReplace: Mock;

describe('errorHandler', () => {
  beforeAll(() => {
    mockReplace = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        replace: mockReplace,
        search: '',
        pathname: 'foo',
      },
    });

    // We don't verify that console.error gets called, but mocking it out
    // avoids console noise filling up the command line as the tests run.
    console.error = jest.fn();
  });

  afterEach(() => {
    mockReplace.mockRestore();
  });

  it('redirects to /signin if called with a GQL authentication error', () => {
    errorResponse = {
      graphQLErrors: [new GraphQLError('Invalid token')],
      operation: null as any as Operation,
      forward: null as any as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).toHaveBeenCalledWith(
      '/signin?redirect_to=foo'
    );
  });

  it('redirects to /signin if called with a 401 NetworkError', () => {
    let networkError: any;
    networkError = new Error('Network error') as ServerError;
    networkError.statusCode = 401;
    errorResponse = {
      networkError,
      operation: null as any as Operation,
      forward: null as any as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).toHaveBeenCalledWith(
      '/signin?redirect_to=foo'
    );
  });

  it('does not redirect if called with a 500 NetworkError', () => {
    let networkError: any = new Error('Inscrutable and mysterious error');
    networkError.statusCode = 500;
    errorResponse = {
      networkError,
      operation: null as any as Operation,
      forward: null as any as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
