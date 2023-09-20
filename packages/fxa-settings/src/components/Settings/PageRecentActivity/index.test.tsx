/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
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
        name: 'Recent account activity',
      })
    ).toBeInTheDocument();
    screen.getByText('Account created');
    screen.getByText('Account disabled');
    screen.getByText('Account enabled');
    screen.getByText('Account login initiated');
    screen.getByText('Password reset initiated');
    screen.getByText('Email bounces cleared');
  });
});
