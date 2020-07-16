/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Account } from './index';

let accountResponse = {
  uid: 'ca1c61239f2448b2af618f0b50226cde',
  emails: [
    {
      email: 'hey@happy.com',
      isVerified: true,
      isPrimary: true,
      createdAt: 1589467100316,
    },
  ],
  createdAt: 1589467100316,
  emailBounces: [],
  onCleared() {},
  query: 'hey@happy.com',
};

it('renders without imploding', () => {
  const { getByTestId } = render(<Account {...accountResponse} />);

  expect(getByTestId('account-section')).toBeInTheDocument();
});

it('displays the account', async () => {
  const { getByTestId, getByText } = render(<Account {...accountResponse} />);

  expect(getByTestId('account-section')).toBeInTheDocument();
  expect(getByTestId('verified-status')).toHaveTextContent('verified');
  expect(getByTestId('email-label')).toHaveTextContent(
    accountResponse.emails[0].email
  );
  expect(getByTestId('uid-label')).toHaveTextContent(accountResponse.uid);
  expect(getByTestId('createdat-label')).toHaveTextContent(
    accountResponse.createdAt.toString()
  );
});

it('displays the unverified account', async () => {
  accountResponse.emails[0].isVerified = false;
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('verified-status')).toHaveTextContent('not verified');
});

it('displays secondary emails', async () => {
  accountResponse.emails.push({
    email: 'ohdeceiver@gmail.com',
    isVerified: false,
    isPrimary: false,
    createdAt: 1589467100316,
  });

  const { getByTestId } = render(<Account {...accountResponse} />);

  expect(getByTestId('secondary-section')).toBeInTheDocument();
  expect(getByTestId('secondary-email')).toHaveTextContent(
    'ohdeceiver@gmail.com'
  );
  expect(getByTestId('secondary-verified')).toHaveTextContent('not verified');
});
