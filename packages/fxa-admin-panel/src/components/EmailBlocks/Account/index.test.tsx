/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Account } from './index';

let accountResponse = {
  uid: 'ca1c61239f2448b2af618f0b50226cde',
  email: 'hey@happy.com',
  createdAt: 1589467100316,
  emailVerified: true,
  emailBounces: [],
  onCleared() {},
};

it('renders without imploding', () => {
  const { getByTestId } = render(<Account {...accountResponse} />);

  expect(getByTestId('account-section')).toBeInTheDocument();
});

it('displays the account', async () => {
  const { getByTestId, getByText } = render(<Account {...accountResponse} />);

  expect(getByTestId('account-section')).toBeInTheDocument();
  expect(getByTestId('verified-status')).toHaveTextContent('verified');
  expect(getByTestId('email-label')).toHaveTextContent(accountResponse.email);
  expect(getByTestId('uid-label')).toHaveTextContent(accountResponse.uid);
  expect(getByTestId('createdat-label')).toHaveTextContent(
    accountResponse.createdAt.toString()
  );
});

it('displays the unverified account', async () => {
  accountResponse.emailVerified = false;
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('verified-status')).toHaveTextContent('not verified');
});
