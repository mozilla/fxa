/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act, wait, screen } from '@testing-library/react';
import { MockedProvider, MockLink } from '@apollo/client/testing';
import { AccountDataHOC } from '../AccountDataHOC';
import { MOCK_GET_ACCOUNT } from './mocks';

// workaround for https://github.com/apollographql/apollo-client/issues/6559
const mockLink = new MockLink([MOCK_GET_ACCOUNT], false);
mockLink.setOnError((error) => {
  return;
});

it('renders without imploding', async () => {
  render(
    <MockedProvider mocks={[MOCK_GET_ACCOUNT]} addTypename={false}>
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
      <MockedProvider mocks={[]} addTypename={false} link={mockLink}>
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
    <MockedProvider mocks={[exampleErrorAccountMock]} addTypename={false}>
      <AccountDataHOC>{() => <div>Content</div>}</AccountDataHOC>
    </MockedProvider>
  );

  await wait();

  expect(screen.getByTestId('error-loading-app')).toBeInTheDocument();
});
