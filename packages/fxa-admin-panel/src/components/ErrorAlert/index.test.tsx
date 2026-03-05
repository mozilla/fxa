/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorAlert from '.';
import { NETWORK_ERROR, REST_API_ERROR } from './mocks';

describe('ErrorAlert', () => {
  it('handles a standard error', () => {
    render(<ErrorAlert error={new Error('boop')} />);
    screen.getByText('Error');
    screen.getByText('boop', { exact: false });
  });

  it('handles a REST API error', () => {
    render(<ErrorAlert error={REST_API_ERROR} />);
    screen.getByText('Error');
    screen.getByText(REST_API_ERROR.message, { exact: false });
  });

  it('handles a network error', () => {
    render(<ErrorAlert error={NETWORK_ERROR} />);
    screen.getByText('Error');
    screen.getByText(NETWORK_ERROR.message, { exact: false });
  });

  it('handles an unknown error', () => {
    render(<ErrorAlert error={'something broke'} />);
    screen.getByText('Error');
    screen.getByText('something broke', { exact: false });
  });
});
