/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { CLEAR_BOUNCES_BY_EMAIL } from './Account/index';
import { GET_ACCOUNT_BY_EMAIL, AccountSearch, GET_EMAILS_LIKE } from './index';

const chance = new Chance();
let testEmail: string;
let deleteBouncesMutationCalled = false;

function exampleBounce(email: string) {
  return {
    email,
    createdAt: chance.timestamp(),
    bounceType: 'Permanent',
    bounceSubType: 'General',
  };
}

function exampleAccountResponse(email: string): MockedResponse {
  return {
    request: {
      query: GET_ACCOUNT_BY_EMAIL,
      variables: {
        email,
      },
    },
    result: {
      data: {
        accountByEmail: {
          uid: 'a1b2c3',
          emails: [
            {
              email,
              isPrimary: true,
              isVerified: true,
              createdAt: chance.timestamp(),
            },
          ],
          createdAt: chance.timestamp(),
          disabledAt: null,
          lockedAt: null,
          emailBounces: [exampleBounce(email), exampleBounce(email)],
          totp: [
            {
              verified: true,
              enabled: true,
              createdAt: 1589467100316,
            },
          ],
          recoveryKeys: [
            {
              createdAt: 1589467100316,
              verifiedAt: 1589467100316,
              enabled: true,
            },
          ],
          attachedClients: [
            {
              deviceId: 'xxxxxxxx-did-1',
              deviceType: 'desktop',
              clientId: null,
              createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
              createdTimeFormatted: '1 hour ago',
              lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
              lastAccessTimeFormatted: '5 seconds ago',
              location: {
                city: null,
                country: null,
                state: null,
                stateCode: null,
              },
              name: "UserX's Nightly on machine-xyz",
              os: 'Mac OS X',
              userAgent: 'Chrome 89',
              sessionTokenId: 'xxxxxxxx-stid-1',
              refreshTokenId: null,
            },
          ],
          securityEvents: [],
        },
      },
    },
  };
}

function exampleNoResultsAccountResponse(email: string): MockedResponse {
  return {
    request: {
      query: GET_ACCOUNT_BY_EMAIL,
      variables: {
        email,
      },
    },
    result: {
      data: {
        accountByEmail: {
          uid: 'a1b2c3',
          emails: [
            {
              email,
              isPrimary: true,
              isVerified: true,
              createdAt: chance.timestamp(),
            },
          ],
          createdAt: chance.timestamp(),
          disabledAt: null,
          lockedAt: null,
          emailBounces: [],
          totp: [],
          recoveryKeys: [],
          securityEvents: [],
        },
      },
    },
  };
}

function exampleBounceMutationResponse(email: string): MockedResponse {
  return {
    request: {
      query: CLEAR_BOUNCES_BY_EMAIL,
      variables: {
        email,
      },
    },
    result: () => {
      deleteBouncesMutationCalled = true;
      return {
        data: {
          clearEmailBounce: true,
        },
      };
    },
  };
}

const MinimalAccountResponse = (testEmail: string) => ({
  data: {
    accountByEmail: {
      uid: '123',
      createdAt: 1658534643990,
      disabledAt: null,
      lockedAt: null,
      emails: [
        {
          email: testEmail,
          isVerified: true,
          isPrimary: true,
          createdAt: 1658534643990,
        },
      ],
      emailBounces: [],
      securityEvents: [],
      totp: [],
      recoveryKeys: [],
      linkedAccounts: [],
      attachedClients: [],
      subscriptions: [],
    },
  },
});

const nextTick = (t?: number) => new Promise((r) => setTimeout(r, t || 0));

beforeEach(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  testEmail = chance.email();
});

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', () => {
  const renderResult = render(<AccountSearch />);
  const getByTestId = renderResult.getByTestId;

  expect(getByTestId('search-form')).toBeInTheDocument();
});

it('calls account search', async () => {
  let calledAccountSearch = false;
  const mocks = [
    {
      request: {
        query: GET_ACCOUNT_BY_EMAIL,
        variables: {
          email: testEmail,
          autoCompleted: false,
        },
      },
      result: () => {
        calledAccountSearch = true;
        return MinimalAccountResponse(testEmail);
      },
    },
  ];

  const renderResult = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AccountSearch />
    </MockedProvider>
  );

  await act(async () => {
    fireEvent.change(renderResult.getByTestId('email-input'), {
      target: { value: testEmail },
    });
    fireEvent.blur(renderResult.getByTestId('email-input'));
  });
  await nextTick();

  await act(async () => {
    fireEvent.click(renderResult.getByTestId('search-button'));
  });
  await nextTick();

  expect(renderResult.getByTestId('account-section')).toBeInTheDocument();
  expect(calledAccountSearch).toBeTruthy();
});

it('auto completes', async () => {
  let calledAccountSearch = false;
  let calledGetEmailsLike = false;
  const mocks = [
    {
      request: {
        query: GET_EMAILS_LIKE,
        variables: {
          search: testEmail.substring(0, 6),
        },
      },
      result: () => {
        calledGetEmailsLike = true;
        return {
          data: {
            getEmailsLike: [{ email: testEmail }],
          },
        };
      },
    },
    {
      request: {
        query: GET_ACCOUNT_BY_EMAIL,
        variables: {
          email: testEmail,
          autoCompleted: true,
        },
      },
      result: () => {
        calledAccountSearch = true;
        return MinimalAccountResponse(testEmail);
      },
    },
  ];

  const renderResult = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AccountSearch />
    </MockedProvider>
  );

  await act(async () => {
    fireEvent.change(renderResult.getByTestId('email-input'), {
      target: { value: testEmail.substring(0, 6) },
    });
    fireEvent.blur(renderResult.getByTestId('email-input'));
  });
  await nextTick();

  await act(async () => {
    fireEvent.click(
      renderResult.getByTestId('email-suggestions').getElementsByTagName('a')[0]
    );
  });
  await nextTick();

  await act(async () => {
    fireEvent.click(renderResult.getByTestId('search-button'));
  });
  await nextTick();

  expect(calledGetEmailsLike).toBeTruthy();
  expect(calledAccountSearch).toBeTruthy();
  expect(renderResult.getByTestId('email-input')).toHaveValue(testEmail);
  expect(renderResult.getByTestId('account-section')).toBeInTheDocument();
});

// FIXME: this test is flaky
it.skip('displays the account email bounces, and can clear them', async () => {
  const hasResultsAccountResponse = exampleAccountResponse(testEmail);
  const bounceMutationResponse = exampleBounceMutationResponse(testEmail);
  const noResultsAccountResponse = exampleNoResultsAccountResponse(testEmail);

  const renderResult = render(
    <MockedProvider
      mocks={[
        hasResultsAccountResponse,
        bounceMutationResponse,
        noResultsAccountResponse,
      ]}
      addTypename={false}
    >
      <AccountSearch />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;
  let queryAllByTestId = renderResult.queryAllByTestId;

  await act(async () => {
    fireEvent.change(getByTestId('email-input'), {
      target: { value: testEmail },
    });
    fireEvent.blur(getByTestId('email-input'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    fireEvent.click(getByTestId('search-button'));
  });

  expect(getByTestId('account-section')).toBeInTheDocument();
  expect(queryAllByTestId('bounce-group').length).toEqual(2);

  fireEvent.click(getByTestId('clear-button'));
  await screen.findAllByText(testEmail);

  // account should still be visible
  expect(getByTestId('account-section')).toBeInTheDocument();
  // but there should be no bounces anymore
  expect(queryAllByTestId('bounce-group').length).toEqual(0);
  expect(getByTestId('no-bounces-message')).toBeInTheDocument();
  expect(deleteBouncesMutationCalled).toBe(true);
});

// FIXME: this test is flaky
it.skip('displays the error state if there is an error', async () => {
  const erroredAccountResponse = Object.assign(
    {},
    exampleAccountResponse(testEmail)
  );
  erroredAccountResponse.error = new Error('zoiks');

  const renderResult = render(
    <MockedProvider mocks={[erroredAccountResponse]} addTypename={false}>
      <AccountSearch />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;

  fireEvent.change(getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.blur(getByTestId('email-input'));

  await act(async () => {
    fireEvent.click(getByTestId('search-button'));
  });

  expect(getByTestId('error-message')).toBeInTheDocument();
});
