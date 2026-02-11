/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerError, ServerParseError } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorAlert from '.';
import {
  GQL_ERROR,
  NETWORK_ERROR,
  NETWORK_SERVER_ERROR,
  NETWORK_SERVER_PARSE_ERROR,
} from './mocks';

describe('ApolloErrorAlert', () => {
  it('handles a standard error', () => {
    render(<ErrorAlert error={new Error('boop')} />);
    screen.getByText('General GQL Error');
    screen.getByText('boop');
  });

  it('handles a network server error', () => {
    render(<ErrorAlert error={NETWORK_SERVER_ERROR} />);
    screen.getByText('Network Error');
    screen.getByText(NETWORK_SERVER_ERROR.message);
    screen.getByText(
      ((NETWORK_SERVER_ERROR.networkError! as ServerError).result! as any)
        .errors[0].message
    );
  });

  it('handles a network server parse error', () => {
    render(<ErrorAlert error={NETWORK_SERVER_PARSE_ERROR} />);
    screen.getByText('Network Error');
    screen.getByText(NETWORK_SERVER_PARSE_ERROR.message);
    screen.getByText(
      (NETWORK_SERVER_PARSE_ERROR.networkError! as ServerParseError).statusCode
    );
    // an actual bodyText response is difficult to test for; just check for error details
    screen.getByText('Request URL:', { exact: false });
  });

  it('handles a network error', () => {
    render(<ErrorAlert error={NETWORK_ERROR} />);
    screen.getByText('Network Error');
    screen.getByText(NETWORK_ERROR.message);
    screen.getByText(
      ((NETWORK_ERROR.networkError! as ServerError).result as any).errors[0]
        .message
    );
  });

  it('handles a graphQL error', () => {
    render(<ErrorAlert error={GQL_ERROR} />);
    screen.getByText('GraphQL Apollo Error');
    // in this case, `GQL_ERROR.message` matches `GQL_ERROR.graphQLErrors[0].message`
    expect(screen.getAllByText(GQL_ERROR.message)).toHaveLength(2);
  });
});
