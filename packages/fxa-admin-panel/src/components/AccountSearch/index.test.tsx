/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import '@testing-library/jest-dom/extend-expect';
import { CLEAR_BOUNCES_BY_EMAIL } from './Account/index';
import { GET_ACCOUNT_BY_EMAIL, AccountSearch } from './index';

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
          sessionTokens: [
            {
              tokenId: 'abcd1234',
              tokenData: 'abcd1234',
              uid: 'ca1c61239f2448b2af618f0b50226cde',
              createdAt: 1589467100316,
              uaBrowser: 'Chrome',
              uaBrowserVersion: '89.0.4389',
              uaOS: 'Mac OS X',
              uaOSVersion: '11.2.1',
              uaDeviceType: 'Mac',
              lastAccessTime: 1589467100316,
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
          emailBounces: [],
          totp: [],
          recoveryKeys: [],
          sessionTokens: [],
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

beforeEach(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  testEmail = chance.email();
});

it('renders without imploding', () => {
  const renderResult = render(<AccountSearch />);
  const getByTestId = renderResult.getByTestId;

  expect(getByTestId('search-form')).toBeInTheDocument();
});

it('displays the account email bounces, and can clear them', async () => {
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

it('displays the error state if there is an error', async () => {
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
