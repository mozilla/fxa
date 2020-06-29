/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act, wait, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AccountDataHOC } from '../AccountDataHOC';
import { MOCK_GET_ACCOUNT } from './mocks';

it('renders without imploding', async () => {
  render(
    <MockedProvider mocks={[MOCK_GET_ACCOUNT]}>
      <AccountDataHOC>
        {() => <div data-testid="children">Content</div>}
      </AccountDataHOC>
    </MockedProvider>
  );

  await wait();

  expect(screen.getByTestId('children')).toBeInTheDocument();
});

it('renders the loading spinner on initial load', async () => {
  await act(async () => {
    render(
      <MockedProvider mocks={[]}>
        <AccountDataHOC>{() => <div>Content</div>}</AccountDataHOC>
      </MockedProvider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});

it('renders the error when loading fails', async () => {
  const exampleErrorAccountMock = {
    request: MOCK_GET_ACCOUNT.request,
    error: new Error('dang!'),
  };

  render(
    <MockedProvider mocks={[exampleErrorAccountMock]}>
      <AccountDataHOC>{() => <div>Content</div>}</AccountDataHOC>
    </MockedProvider>
  );

  await wait();

  expect(screen.getByTestId('error-loading-app')).toBeInTheDocument();
});
