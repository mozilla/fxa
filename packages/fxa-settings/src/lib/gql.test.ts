/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { errorHandler } from './gql';
import { ErrorResponse } from '@apollo/client/link/error';
import { Operation, NextLink, ServerError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';

let errorResponse: ErrorResponse;

describe('errorHandler', () => {
  let realLocation: Location;

  beforeAll(() => {
    // Note: it's surprisingly difficult to mock out window.location cleanly.
    // Messing with globals is gross, but works, and is really simple.
    realLocation = window.location;
    delete window.location;
    window.location = {
      replace: jest.fn(),
      search: '',
      pathname: 'foo',
    };

    // We don't verify that console.error gets called, but mocking it out
    // avoids console noise filling up the command line as the tests run.
    console.error = jest.fn();
  });

  afterAll(() => {
    window.location = realLocation;
    console.error.mockRestore();
  });

  beforeEach(() => {
    window.location.replace.mockClear();
  });

  it('redirects to /get_flow if called with a GQL authentication error', () => {
    errorResponse = {
      graphQLErrors: [
        new GraphQLError(
          'Incorrect password',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'UNAUTHENTICATED' }
        ),
      ],
      operation: (null as any) as Operation,
      forward: (null as any) as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).toHaveBeenCalledWith(
      '/get_flow?redirect_to=foo'
    );
  });

  it('redirects to get_flow if called with a 401 NetworkError', () => {
    let networkError: any;
    networkError = new Error('Network error') as ServerError;
    networkError.statusCode = 401;
    errorResponse = {
      networkError,
      operation: (null as any) as Operation,
      forward: (null as any) as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).toHaveBeenCalledWith(
      '/get_flow?redirect_to=foo'
    );
  });

  it('does not redirect if called with a 500 NetworkError', () => {
    let networkError: any = new Error('Inscrutable and mysterious error');
    networkError.statusCode = 500;
    errorResponse = {
      networkError,
      operation: (null as any) as Operation,
      forward: (null as any) as NextLink,
    };

    errorHandler(errorResponse);

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
