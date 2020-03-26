/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, act } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import '@testing-library/jest-dom/extend-expect';
import { GET_ACCOUNT_BY_EMAIL, EmailBlocks } from './index';

const chance = new Chance();

const exampleEmail = chance.email();

function exampleEmailBounce() {
  return {
    email: exampleEmail,
    createdAt: chance.timestamp(),
    bounceType: 'Permanent',
    bounceSubType: 'General',
  };
}

const exampleAccount: MockedResponse = {
  request: {
    query: GET_ACCOUNT_BY_EMAIL,
    variables: {
      email: exampleEmail,
    },
  },
  result: {
    data: {
      accountByEmail: {
        uid: 'a1b2c3',
        email: exampleEmail,
        createdAt: chance.timestamp(),
        emailBounces: [exampleEmailBounce(), exampleEmailBounce()],
      },
    },
  },
};

it('renders without imploding', () => {
  const renderResult = render(<EmailBlocks />);
  const getByTestId = renderResult.getByTestId;

  expect(getByTestId('form')).toBeInTheDocument();
});

test.skip('displays the loading state on submit', async () => {
  const renderResult = render(
    <MockedProvider mocks={[]}>
      <EmailBlocks />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;

  fireEvent.change(getByTestId('email'), {
    target: { value: exampleEmail },
  });
  fireEvent.blur(getByTestId('email'));

  await act(async () => {
    fireEvent.click(getByTestId('button'));
  });

  expect(getByTestId('loading')).toBeInTheDocument();
});

it('displays the results when there are results', async () => {
  const renderResult = render(
    <MockedProvider mocks={[exampleAccount]} addTypename={false}>
      <EmailBlocks />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;
  let queryAllByTestId = renderResult.queryAllByTestId;

  fireEvent.change(getByTestId('email'), {
    target: { value: exampleEmail },
  });
  fireEvent.blur(getByTestId('email'));

  await act(async () => {
    fireEvent.click(getByTestId('button'));
  });

  expect(getByTestId('account')).toBeInTheDocument();
  expect(queryAllByTestId('bounce').length).toEqual(2);
});

it('displays the error state if theres an error', async () => {
  const accountResponse = exampleAccount;
  accountResponse.error = new Error('zoiks');

  const renderResult = render(
    <MockedProvider mocks={[accountResponse]} addTypename={false}>
      <EmailBlocks />
    </MockedProvider>
  );
  let getByTestId = renderResult.getByTestId;

  fireEvent.change(getByTestId('email'), {
    target: { value: exampleEmail },
  });
  fireEvent.blur(getByTestId('email'));

  await act(async () => {
    fireEvent.click(getByTestId('button'));
  });

  expect(getByTestId('error')).toBeInTheDocument();
});
