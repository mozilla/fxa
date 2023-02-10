/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, screen } from '@testing-library/react';
import { renderWithRouter, mockAppContext } from '../../../models/mocks';
import React from 'react';
import PageRecentActivity from '.';
import { Account, AppContext } from '../../../models';
import { MOCK_SECURITY_EVENTS } from './mocks';

const account = {
  primaryEmail: {
    email: 'foxy@mozilla.com',
  },
  getSecurityEvents: jest.fn().mockResolvedValue(MOCK_SECURITY_EVENTS),
} as unknown as Account;

const render = (acct: Account = account) =>
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account: acct })}>
      <PageRecentActivity />
    </AppContext.Provider>
  );

describe('Recent Account Activity', () => {
  it('renders', async () => {
    await act(async () => {
      await render();
    });
    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();

    expect(account.getSecurityEvents).toBeCalled();

    expect(
      screen.getByRole('heading', {
        name: 'Recent Account Activity',
      })
    ).toBeInTheDocument();
    screen.getByText('Account was created');
    screen.getByText('Account was disabled');
    screen.getByText('Account was enabled');
    screen.getByText('Account initiated login');
    screen.getByText('Account initiated password reset');
    screen.getByText('Account cleared email bounces');
  });
});
