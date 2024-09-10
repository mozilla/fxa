/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import * as Metrics from '../../../lib/metrics';
import { Config } from '../../../lib/config';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

const accountHasRecoveryKey = {
  hasPassword: true,
  recoveryKey: { exists: true },
} as unknown as Account;

const accountWithoutRecoveryKey = {
  hasPassword: true,
  recoveryKey: { exists: false },
} as unknown as Account;

const accountWithoutPassword = {
  hasPassword: false,
  recoveryKey: { exists: false },
} as unknown as Account;

const renderWithContext = (
  account: Partial<Account>,
  config?: Partial<Config>
) => {
  const context = { account: account as Account, config: config as Config };

  renderWithRouter(
    <AppContext.Provider value={mockAppContext(context)}>
      <UnitRowRecoveryKey />
    </AppContext.Provider>
  );
};

describe('UnitRowRecoveryKey', () => {
  it('renders as expected when account recovery key is set', () => {
    renderWithContext(accountHasRecoveryKey);
    screen.getByRole('heading', { name: 'Account recovery key' });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Enabled');
    screen.getByRole('link', { name: 'Change' });
    const deleteButtons = screen.getAllByRole('button');
    deleteButtons.forEach((button) => {
      expect(button).toHaveAttribute('title', 'Delete account recovery key');
      expect(button.firstElementChild).toHaveAttribute(
        'aria-label',
        'Delete account recovery key'
      );
    });
  });

  it('renders as expected when account recovery key is not set', () => {
    renderWithContext(accountWithoutRecoveryKey);
    screen.getByRole('heading', { name: 'Account recovery key' });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Not Set');
    const createRKLink = screen.getByRole('link', { name: 'Create' });
    expect(createRKLink).toHaveAttribute('href', '/settings/account_recovery');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables key creation when account has no password', () => {
    renderWithContext(accountWithoutPassword);
    screen.getByRole('heading', { name: 'Account recovery key' });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Not Set');
    const createRKButton = screen.getByTestId('recovery-key-unit-row-route');
    expect(createRKButton).toBeDisabled();
    expect(createRKButton).toHaveAttribute(
      'title',
      'Set a password to sync and use certain account security features.'
    );
    const deleteButtons = screen.getAllByRole('button');
    deleteButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  describe('delete account recovery key', () => {
    const expectRevokeEvent = (event: string) => {
      expect(Metrics.logViewEvent).toHaveBeenCalledWith(
        'flow.settings.account-recovery',
        `confirm-revoke.${event}`
      );
    };

    afterEach(() => jest.clearAllMocks());

    it('emits correct submit and success metrics on successful deletion', async () => {
      const accountHasRecoveryKeyWithDeleteSuccess = {
        hasPassword: true,
        recoveryKey: { exists: true },
        deleteRecoveryKey: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithContext(accountHasRecoveryKeyWithDeleteSuccess);

      const deleteButtons = screen.getAllByRole('button', { hidden: false });

      fireEvent.click(deleteButtons[0]);
      await waitFor(() =>
        screen.findByLabelText('Remove account recovery key?')
      );
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => expectRevokeEvent('submit'));
      await waitFor(() => expectRevokeEvent('success'));
    });

    it('emits expected submit and failure metrics on failed deletion', async () => {
      const accountHasRecoveryKeyWithDeleteFailure = {
        hasPassword: true,
        recoveryKey: { exists: true },
        deleteRecoveryKey: jest.fn().mockRejectedValue(false),
      } as unknown as Account;

      renderWithContext(accountHasRecoveryKeyWithDeleteFailure);

      const deleteButtons = screen.getAllByRole('button', { hidden: false });

      fireEvent.click(deleteButtons[0]);
      await waitFor(() =>
        screen.findByLabelText('Remove account recovery key?')
      );
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => expectRevokeEvent('submit'));
      await waitFor(() => expectRevokeEvent('fail'));
    });
  });
});
