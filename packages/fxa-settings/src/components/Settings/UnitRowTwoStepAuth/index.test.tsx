/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { createSubject } from './mocks';
import {
  MOCK_FULL_PHONE_NUMBER,
  MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER,
  MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
} from '../../../pages/mocks';
import GleanMetrics from '../../../lib/glean';
import { JwtTokenCache } from '../../../lib/cache';

jest.mock('../../../models/AlertBarInfo');

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => ({
    mfaRequestOtp: jest.fn(),
  }),
}));

// Mocks to suppress MFA Guard
jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(),
    getToken: jest.fn(),
    getSnapshot: jest.fn(),
    subscribe: jest.fn(),
  },
  sessionToken: () => 'session-123',
}));

describe('UnitRowTwoStepAuth', () => {
  beforeEach(() => {
    (JwtTokenCache.hasToken as jest.Mock).mockReturnValue(true);
    (JwtTokenCache.getToken as jest.Mock).mockReturnValue('jwt-123');
    (JwtTokenCache.getSnapshot as jest.Mock).mockReturnValue(true);
  });

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
    expect(screen.getByRole('link', { name: 'Change' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute(
      'data-glean-id',
      'account_pref_two_step_auth_change_submit'
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
    expect(
      screen.getByTestId('two-step-unit-row-modal-button').textContent
    ).toContain('Add');
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    const user = userEvent.setup();
    const disableTwoStepAuthMock = jest.fn().mockResolvedValue(true);

    renderWithRouter(
      createSubject({
        disableTwoStepAuth: disableTwoStepAuthMock,
      })
    );

    await user.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() =>
      expect(
        screen.queryByTestId('disable-totp-modal-header')
      ).toBeInTheDocument()
    );

    await user.click(screen.getByTestId('modal-confirm'));

    await waitFor(() =>
      expect(disableTwoStepAuthMock).toHaveBeenCalledTimes(1)
    );
  });

  it('emits expected event when the disable totp modal is rendered', async () => {
    const spy = jest.spyOn(
      GleanMetrics.accountPref,
      'twoStepAuthDisableModalView'
    );
    const user = userEvent.setup();
    renderWithRouter(createSubject());

    await user.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() =>
      expect(
        screen.queryByTestId('disable-totp-modal-header')
      ).toBeInTheDocument()
    );

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it('renders MFAGuard when the disable totp modal is rendered and jwt is missing', async () => {
    (JwtTokenCache.hasToken as jest.Mock).mockReturnValue(false);
    const user = userEvent.setup();

    renderWithRouter(createSubject());

    await user.click(screen.getByRole('button', { name: 'Disable' }));

    expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
  });

  it('renders with no backup codes and no recovery phone', () => {
    renderWithRouter(
      createSubject({
        backupCodes: { hasBackupCodes: false, count: 0 },
        recoveryPhone: {
          exists: false,
          phoneNumber: null,
          nationalFormat: null,
          available: false,
        },
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
          nationalFormat: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
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
    ).toContain(MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER);
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
          nationalFormat: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
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
    ).toContain(MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER);
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
          nationalFormat: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
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
    ).toContain(MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER);
    expect(
      screen.getByTestId('backup-authentication-codes-sub-row').textContent
    ).toContain('1');
    // There are two because they are conditionally rendered based on the container size
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });
});
