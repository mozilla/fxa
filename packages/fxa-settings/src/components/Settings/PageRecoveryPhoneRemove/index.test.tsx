/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PageRecoveryPhoneRemove from '.';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Account, AppContext } from '../../../models';
import {
  mockAppContext,
  mockSettingsContext,
  renderWithRouter,
} from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

const account = {
  removeRecoveryPhone: jest.fn().mockResolvedValue({}),
} as unknown as Account;

describe('PageRecoveryPhoneRemove', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    expect(
      screen.getByRole('heading', { name: 'Remove recovery phone number' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'We recommend you keep this method because it’s easier than saving backup authentication codes.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you delete it, make sure you still have your saved authentication codes.'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Compare recovery methods/ })
    ).toHaveAttribute(
      'href',
      'https://support.mozilla.org/en-US/kb/secure-firefox-account-two-step-authentication'
    );
  });

  it('submits', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext()}>
          <PageRecoveryPhoneRemove />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Remove phone number' })
      );
    });

    expect(account.removeRecoveryPhone).toBeCalled();
  });
});
