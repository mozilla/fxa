/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act, wait } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import Settings from './index';
import { GET_ACCOUNT, accountData } from './gql';

const exampleAccountMock: MockedResponse = {
  request: {
    query: GET_ACCOUNT,
  },
  result: {
    data: {
      account: {
        uid: 'abc123',
        displayName: 'John Dope',
        avatarUrl: 'http://avatars.com/y2k',
        accountCreated: 123456789,
        passwordCreated: 123456789,
        recoveryKey: true,
        attachedClients: [],
        subscriptions: [],
        emails: [
          {
            email: 'johndope@example.com',
            isPrimary: true,
            verified: true,
          },
        ],
        totp: {
          exists: true,
          verified: true,
        },
      } as accountData,
    },
  },
};

it('renders without imploding', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={[exampleAccountMock]}>
      <Settings />
    </MockedProvider>
  );

  await wait();

  expect(getByTestId('settings-profile')).toBeInTheDocument();
});

it('renders the loading spinner on initial load', async () => {
  await act(async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <Settings />
      </MockedProvider>
    );

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });
});

it('renders the error when loading fails', async () => {
  const exampleErrorAccountMock = {
    request: exampleAccountMock.request,
    error: new Error('dang!'),
  };

  const { getByTestId } = render(
    <MockedProvider mocks={[exampleErrorAccountMock]}>
      <Settings />
    </MockedProvider>
  );

  await wait();

  expect(getByTestId('error-loading-app')).toBeInTheDocument();
});
