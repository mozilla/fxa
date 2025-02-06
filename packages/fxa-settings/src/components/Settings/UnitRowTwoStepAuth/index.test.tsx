/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
import { createSubject } from './mocks';
import {
  MOCK_FULL_PHONE_NUMBER,
  MOCK_MASKED_PHONE_NUMBER,
} from '../../../pages/mocks';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../models/AlertBarInfo');

jest.mock('../../../lib/glean', () => ({
  accountPref: {
    twoStepAuthDisableModalView: jest.fn(),
  },
}));

describe('UnitRowTwoStepAuth', () => {
  it('renders when two-step authentication is enabled', async () => {
    renderWithRouter(createSubject());

    expect(
      screen.getByTestId('two-step-unit-row-header').textContent
    ).toContain('Two-step authentication');
    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(screen.getByRole('button', { name: 'Disable' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Disable' })).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_disable_click'
    );
  });

  it('renders when two-step authentication is not enabled', () => {
    renderWithRouter(
      createSubject({
        totp: { exists: false, verified: false },
        backupCodes: { hasBackupCodes: false, count: 0 },
      })
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
    expect(screen.getByTestId('two-step-unit-row-route')).toHaveAttribute(
      'data-glean-id',
      'account_pref_two_step_auth_add_click'
    );
  });

  it('renders disabled state when account has no password', async () => {
    renderWithRouter(
      createSubject({
        hasPassword: false,
        totp: { exists: false, verified: false },
        backupCodes: { hasBackupCodes: false, count: 0 },
      })
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

  it('renders view as not enabled after disabling TOTP', async () => {
    const disableTwoStepAuthMock = jest.fn().mockResolvedValue(true);

    renderWithRouter(
      createSubject({
        disableTwoStepAuth: disableTwoStepAuthMock,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() =>
      expect(
        screen.queryByTestId('disable-totp-modal-header')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() =>
      expect(disableTwoStepAuthMock).toHaveBeenCalledTimes(1)
    );
  });

  it('emits expected event when the disable totp modal is rendered', async () => {
    renderWithRouter(createSubject());

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() =>
      expect(
        screen.queryByTestId('disable-totp-modal-header')
      ).toBeInTheDocument()
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthDisableModalView
    ).toHaveBeenCalled();
  });

  it('renders with no backup codes and no recovery phone', () => {
    renderWithRouter(
      createSubject({
        backupCodes: { hasBackupCodes: false, count: 0 },
        recoveryPhone: { exists: false, phoneNumber: null, available: false },
      })
    );

    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.queryByTestId('backup-authentication-codes-sub-row')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('backup-recovery-phone-sub-row')
    ).not.toBeInTheDocument();
  });

  it('renders with backup phone but no backup codes', () => {
    renderWithRouter(
      createSubject({
        recoveryPhone: {
          exists: true,
          phoneNumber: MOCK_FULL_PHONE_NUMBER,
          available: true,
        },
        backupCodes: { hasBackupCodes: false, count: 0 },
      })
    );

    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('backup-recovery-phone-sub-row').textContent
    ).toContain(MOCK_MASKED_PHONE_NUMBER);
    expect(
      screen.queryByTestId('backup-authentication-codes-sub-row')
    ).toBeInTheDocument();
  });

  it('renders with backup codes and backup phone', () => {
    renderWithRouter(
      createSubject({
        recoveryPhone: {
          exists: true,
          phoneNumber: MOCK_FULL_PHONE_NUMBER,
          available: true,
        },
        backupCodes: { hasBackupCodes: true, count: 3 },
      })
    );

    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('backup-recovery-phone-sub-row').textContent
    ).toContain(MOCK_MASKED_PHONE_NUMBER);
    expect(
      screen.getByTestId('backup-authentication-codes-sub-row').textContent
    ).toContain('3');
    // There are two because they are conditionally rendered based on the container size
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });

  it('renders with backup phone added but currently unsupported recovery phone region', () => {
    renderWithRouter(
      createSubject({
        recoveryPhone: {
          exists: true,
          phoneNumber: MOCK_FULL_PHONE_NUMBER,
          available: false,
        },
        backupCodes: { hasBackupCodes: true, count: 1 },
      })
    );

    expect(
      screen.getByTestId('two-step-unit-row-header-value').textContent
    ).toContain('Enabled');
    expect(
      screen.getByTestId('backup-recovery-phone-sub-row').textContent
    ).toContain(MOCK_MASKED_PHONE_NUMBER);
    expect(
      screen.getByTestId('backup-authentication-codes-sub-row').textContent
    ).toContain('1');
    // There are two because they are conditionally rendered based on the container size
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });
});
