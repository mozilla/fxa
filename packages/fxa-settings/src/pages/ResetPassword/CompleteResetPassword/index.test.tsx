/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL, MOCK_PASSWORD } from '../../mocks';
import GleanMetrics from '../../../lib/glean';

const mockSubmitNewPassword = jest.fn((newPassword: string) =>
  Promise.resolve()
);

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      createNewView: jest.fn(),
      recoveryKeyCreatePasswordView: jest.fn(),
    },
  },
}));

describe('CompleteResetPassword page', () => {
  beforeEach(() => {
    (GleanMetrics.passwordReset.createNewView as jest.Mock).mockClear();
    (
      GleanMetrics.passwordReset.recoveryKeyCreatePasswordView as jest.Mock
    ).mockClear();
    mockSubmitNewPassword.mockClear();
  });

  describe('default reset without recovery key', () => {
    it('renders as expected for account with sync', async () => {
      renderWithLocalizationProvider(
        <Subject recoveryKeyExists={false} estimatedSyncDeviceCount={2} />
      );

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning message about data loss should should be displayed
      expect(
        screen.getByText(
          'Resetting your password may delete your encrypted browser data.'
        )
      ).toBeVisible();

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      expect(screen.getByLabelText('New password')).toBeVisible();
      expect(screen.getByLabelText('Re-enter password')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Reset password' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      const link = screen.getByRole('link', { name: 'Sign in' });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute(
        'href',
        `/?prefillEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });

    it('renders as expected for account without sync', async () => {
      renderWithLocalizationProvider(
        <Subject recoveryKeyExists={false} estimatedSyncDeviceCount={0} />
      );

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning messages about data loss should not be displayed.
      expect(
        screen.queryByText(
          'Resetting your password may delete your encrypted browser data.'
        )
      ).not.toBeInTheDocument();

      // Warning message about using recovery ke should not be displayed
      expect(
        screen.queryByText('Reset your password with your recovery key.')
      ).not.toBeInTheDocument();
    });

    it('sends the expected metrics on render', () => {
      renderWithLocalizationProvider(
        <Subject recoveryKeyExists={false} estimatedSyncDeviceCount={2} />
      );
      expect(GleanMetrics.passwordReset.createNewView).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset with account recovery key confirmed', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(<Subject hasConfirmedRecoveryKey />);

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning messages about data loss should not be displayed.
      expect(
        screen.queryByText(
          'Resetting your password may delete your encrypted browser data.'
        )
      ).not.toBeInTheDocument();

      // Warning message about using recovery key should not be displayed
      expect(
        screen.queryByText('Reset your password with your recovery key.')
      ).not.toBeInTheDocument();

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      expect(screen.getByLabelText('New password')).toBeVisible();
      expect(screen.getByLabelText('Re-enter password')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Reset password' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      const link = screen.getByRole('link', { name: 'Sign in' });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute(
        'href',
        `/?prefillEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });

    it('sends the expected metrics on render', () => {
      renderWithLocalizationProvider(<Subject hasConfirmedRecoveryKey />);
      expect(
        GleanMetrics.passwordReset.recoveryKeyCreatePasswordView
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset with unconfimred account recovery key', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(
        <Subject
          hasConfirmedRecoveryKey={false}
          recoveryKeyExists={true}
          estimatedSyncDeviceCount={2}
        />
      );

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning messages about data loss should not be displayed.
      expect(
        screen.queryByText(
          'Resetting your password may delete your encrypted browser data.'
        )
      ).toBeInTheDocument();

      // Warning message about using recovery key should be displayed
      expect(
        screen.queryByText('Reset your password with your recovery key.')
      ).not.toBeInTheDocument();
    });
  });

  describe('reset with issue determining if recovery key exists', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(
        <Subject
          hasConfirmedRecoveryKey={false}
          recoveryKeyExists={undefined}
          estimatedSyncDeviceCount={2}
        />
      );

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning messages about data loss should not be displayed.
      expect(
        screen.queryByText(
          'Resetting your password may delete your encrypted browser data.'
        )
      ).not.toBeInTheDocument();

      // Warning message about using recovery key should be displayed
      expect(
        screen.getByText('Reset your password with your recovery key.')
      ).toBeVisible();
    });
  });

  it('handles submit with valid password', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <Subject submitNewPassword={mockSubmitNewPassword} />
    );

    await waitFor(() =>
      user.type(screen.getByLabelText('New password'), MOCK_PASSWORD)
    );
    await waitFor(() =>
      user.type(screen.getByLabelText('Re-enter password'), MOCK_PASSWORD)
    );
    const button = screen.getByRole('button', { name: 'Reset password' });
    expect(button).toBeEnabled();
    await waitFor(() => user.click(button));

    expect(mockSubmitNewPassword).toHaveBeenCalledTimes(1);
    expect(mockSubmitNewPassword).toHaveBeenCalledWith(MOCK_PASSWORD);
  });

  it('handles errors', async () => {
    renderWithLocalizationProvider(
      <Subject testErrorMessage="Something went wrong" />
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: 'Create a new password',
        })
      ).toBeVisible()
    );
    expect(screen.getByText('Something went wrong')).toBeVisible();
  });
});
