/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { UnitRowTwoStepAuth } from '.';
import {
  renderWithRouter,
  mockAppContext,
  mockSettingsContext,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

jest.mock('../../../models/AlertBarInfo');
const account = {
  hasPassword: true,
  backupCodes: { hasBackupCodes: true, count: 3 },
  totp: { exists: true, verified: true },
  disableTwoStepAuth: jest.fn().mockResolvedValue(true),
} as unknown as Account;

describe('UnitRowTwoStepAuth', () => {
  it('renders when Two-step authentication is enabled', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('Two-step authentication');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(screen.getByRole('button', { name: 'Disable' })).toBeVisible();
  });

  it('renders as expected when Two-step authentication is not enabled', () => {
    const account = {
      hasPassword: true,
      totp: { exists: false, verified: false },
      backupCodes: { hasBackupCodes: false, count: 0 },
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );
    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('Two-step authentication');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Disabled');
    expect(screen.getByTestId('two-step-unit-row-route').textContent).toContain(
      'Add'
    );
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    const context = mockAppContext({ account });
    const settingsContext = mockSettingsContext();
    renderWithRouter(
      <AppContext.Provider value={context}>
        <SettingsContext.Provider value={settingsContext}>
          <UnitRowTwoStepAuth />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() =>
      expect(
        screen.queryByTestId('disable-totp-modal-header')
      ).toBeInTheDocument()
    );

    // using test id here because the modal cta has the same name as the row button
    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() =>
      expect(settingsContext.alertBarInfo?.success).toBeCalledTimes(1)
    );
  });

  it('renders disabled state when account has no password', async () => {
    const account = {
      hasPassword: false,
      totp: { exists: false, verified: false },
      backupCodes: { hasBackupCodes: false, count: 0 },
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <UnitRowTwoStepAuth />
      </AppContext.Provider>
    );

    const mainButton = await screen.findByText('Add');
    expect(mainButton).toBeDisabled();
    expect(mainButton).toHaveAttribute(
      'title',
      'Set a password to sync and use certain account security features.'
    );
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Disabled');
    expect(
      screen.queryByTestId('backup-authentication-codes-sub-row')
    ).not.toBeInTheDocument();
  });
});
