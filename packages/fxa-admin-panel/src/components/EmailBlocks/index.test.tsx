/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, act } from '@testing-library/react';
import { MockedProvider, MockedResponse, wait } from '@apollo/react-testing';
import '@testing-library/jest-dom/extend-expect';
import { CLEAR_BOUNCES_BY_EMAIL } from './Account/index';
import { GET_ACCOUNT_BY_EMAIL, EmailBlocks } from './index';

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
          email,
          createdAt: chance.timestamp(),
          emailBounces: [exampleBounce(email), exampleBounce(email)],
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

beforeAll(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
});

beforeEach(() => {
  testEmail = chance.email();
});

it('renders without imploding', () => {
  const renderResult = render(<EmailBlocks />);
  const getByTestId = renderResult.getByTestId;

  expect(getByTestId('search-form')).toBeInTheDocument();
});

it('displays the account email bounces, and can clear them', async () => {
  const hasResultsAccountResponse = exampleAccountResponse(testEmail);
  const bounceMutationResponse = exampleBounceMutationResponse(testEmail);
  let noResultsAccountResponse = Object.assign(
    exampleAccountResponse(testEmail),
    { result: { data: { accountByEmail: { emailBounces: [] } } } }
  );

  const renderResult = render(
    <MockedProvider
      mocks={[
        hasResultsAccountResponse,
        bounceMutationResponse,
        noResultsAccountResponse,
      ]}
      addTypename={false}
    >
      <EmailBlocks />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;
  let queryAllByTestId = renderResult.queryAllByTestId;

  await act(async () => {
    fireEvent.change(getByTestId('email-input'), {
      target: { value: testEmail },
    });
    fireEvent.blur(getByTestId('email-input'));

    await wait(0);

    fireEvent.click(getByTestId('search-button'));
  });

  await wait(0);

  expect(getByTestId('account-section')).toBeInTheDocument();
  expect(queryAllByTestId('bounce-group').length).toEqual(2);

  await act(async () => {
    fireEvent.click(getByTestId('clear-button'));
  });
  // account should still be visible
  expect(getByTestId('account-section')).toBeInTheDocument();
  // but there should be no bounces anymore
  expect(queryAllByTestId('bounce-group').length).toEqual(0);
  expect(getByTestId('no-bounces-message')).toBeInTheDocument();
  expect(deleteBouncesMutationCalled).toBe(true);
});

it('displays the error state if theres an error', async () => {
  const erroredAccountResponse = Object.assign(
    {},
    exampleAccountResponse(testEmail)
  );
  erroredAccountResponse.error = new Error('zoiks');

  const renderResult = render(
    <MockedProvider mocks={[erroredAccountResponse]} addTypename={false}>
      <EmailBlocks />
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
