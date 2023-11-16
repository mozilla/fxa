/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  screen,
  fireEvent,
  act,
  within,
  waitFor,
} from '@testing-library/react';
import UnitRowRecoveryKey from '.';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import * as Metrics from '../../../lib/metrics';
import { Config, getDefault } from '../../../lib/config';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

const accountHasRecoveryKey = {
  hasPassword: true,
  recoveryKey: true,
} as unknown as Account;

const accountWithoutRecoveryKey = {
  hasPassword: true,
  recoveryKey: false,
} as unknown as Account;

const accountWithoutPassword = {
  hasPassword: false,
  recoveryKey: false,
} as unknown as Account;

// Remove feature flag config in FXA-7419
const featureFlagConfig = {
  ...getDefault(),
  showRecoveryKeyV2: true,
} as unknown as Config;

const renderWithContext = (
  account: Partial<Account>,
  config?: Partial<Config>,
  showRecoveryKeyV2?: boolean
) => {
  const context = { account: account as Account, config: config as Config };

  renderWithRouter(
    <AppContext.Provider value={mockAppContext(context)}>
      <UnitRowRecoveryKey {...{ showRecoveryKeyV2 }} />
    </AppContext.Provider>
  );
};

describe('UnitRowRecoveryKey', () => {
  // TESTS FOR PREVIOUS FLOW
  // TODO Remove old tests in FXA-7419
  it('renders when account recovery key is set', () => {
    renderWithContext(accountHasRecoveryKey);
    expect(
      screen.getByTestId('recovery-key-unit-row-header').textContent
    ).toContain('Account recovery key');
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('recovery-key-unit-row-modal').textContent
    ).toContain('Remove');
    expect(screen.getByTestId('recovery-key-refresh')).toHaveAttribute(
      'title',
      'Refresh account recovery key'
    );
  });

  it('renders when account recovery key is not set', () => {
    renderWithContext(accountWithoutRecoveryKey);
    expect(
      screen.getByTestId('recovery-key-unit-row-header').textContent
    ).toContain('Account recovery key');
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Not Set');
    expect(
      screen.getByTestId('recovery-key-unit-row-route').textContent
    ).toContain('Create');
  });

  it('renders disabled state when account has no password', () => {
    renderWithContext(accountWithoutPassword);
    expect(
      screen.getByTestId('recovery-key-unit-row-route').textContent
    ).toContain('Create');

    expect(
      screen
        .getByTestId('recovery-key-unit-row-route')
        .attributes.getNamedItem('title')?.value
    ).toEqual(
      'Set a password to sync and use certain account security features.'
    );
  });

  it('can be refreshed', async () => {
    const account = {
      hasPassword: true,
      recoveryKey: false,
      refresh: jest.fn(),
    } as unknown as Account;
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowRecoveryKey />
        </AppContext.Provider>
      );
    });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value')
    ).toHaveTextContent('Not Set');
    await act(async () => {
      fireEvent.click(screen.getByTestId('recovery-key-refresh'));
    });
    expect(account.refresh).toBeCalledWith('recovery');
  });

  describe('delete account recovery key', () => {
    let logViewEventSpy: jest.SpyInstance;

    beforeAll(() => {
      logViewEventSpy = jest
        .spyOn(Metrics, 'logViewEvent')
        .mockImplementation();
    });

    afterEach(() => {
      logViewEventSpy.mockReset();
    });

    afterAll(() => {
      logViewEventSpy.mockRestore();
    });

    const removeRecoveryKey = async (process = false) => {
      const account = {
        hasPassword: true,
        recoveryKey: true,
      } as unknown as Account;

      if (process) {
        account.deleteRecoveryKey = jest.fn().mockResolvedValue(true);
      }

      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <UnitRowRecoveryKey />
        </AppContext.Provider>
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Remove' }));
      fireEvent.click(
        await within(
          await screen.findByLabelText('Remove account recovery key?')
        ).findByRole('button', { name: 'Remove' })
      );
    };

    const expectRevokeEvent = (event: string) => {
      expect(logViewEventSpy).toHaveBeenCalledWith(
        'flow.settings.account-recovery',
        `confirm-revoke.${event}`
      );
    };

    it('emits correct metrics submit and success events', async () => {
      await removeRecoveryKey(true);
      await waitFor(() => expect(logViewEventSpy).toBeCalledTimes(2));
      expectRevokeEvent('submit');
      expectRevokeEvent('success');
    });

    it('emits metrics submit and failure events', async () => {
      await removeRecoveryKey();
      expect(logViewEventSpy).toBeCalledTimes(2);
      expectRevokeEvent('submit');
      expectRevokeEvent('fail');
    });
  });

  // NEW TESTS FOR VERSION 2
  it('renders version 2 as expected when account recovery key is set', () => {
    renderWithContext(accountHasRecoveryKey, featureFlagConfig, true);
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

  it('renders version 2 as expected when account recovery key is not set', () => {
    renderWithContext(accountWithoutRecoveryKey, featureFlagConfig, true);
    screen.getByRole('heading', { name: 'Account recovery key' });
    expect(
      screen.getByTestId('recovery-key-unit-row-header-value').textContent
    ).toContain('Not Set');
    const createRKLink = screen.getByRole('link', { name: 'Create' });
    expect(createRKLink).toHaveAttribute('href', '/settings/account_recovery');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables key creation in version 2 when account has no password', () => {
    renderWithContext(accountWithoutPassword, featureFlagConfig, true);
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

  describe('delete account recovery key in version 2', () => {
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
        recoveryKey: true,
        deleteRecoveryKey: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithContext(
        accountHasRecoveryKeyWithDeleteSuccess,
        featureFlagConfig,
        true
      );

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
        recoveryKey: true,
        deleteRecoveryKey: jest.fn().mockRejectedValue(false),
      } as unknown as Account;

      renderWithContext(
        accountHasRecoveryKeyWithDeleteFailure,
        featureFlagConfig,
        true
      );

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
