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

const serviceRelayText =
  'Firefox will try sending you back to use an email mask after you sign in.';

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
        screen.getByText('Your browser data may not be recovered')
      ).toBeVisible();

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      expect(screen.getByLabelText('New password')).toBeVisible();
      expect(screen.getByLabelText('Confirm password')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Create new password' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      const link = screen.getByRole('link', { name: 'Sign in' });
      expect(link).toBeVisible();
      // note: email is passed in location state by the sub-component
      expect(link).toHaveAttribute('href', '/');

      expect(
        screen.queryByRole('link', { name: 'Use account recovery key' })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(serviceRelayText)).not.toBeInTheDocument();
    });

    it('renders expected text when service=relay', () => {
      renderWithLocalizationProvider(
        <Subject
          isDesktopServiceRelay={true}
          estimatedSyncDeviceCount={0}
          recoveryKeyExists={false}
        />
      );
      screen.getByText(serviceRelayText);
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
        screen.queryByText('Your browser data may not be recovered')
      ).not.toBeInTheDocument();

      // Warning message about using recovery key should not be displayed
      expect(
        screen.queryByText('Reset your password and keep your data')
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('link', { name: 'Use account recovery key' })
      ).not.toBeInTheDocument();
    });

    it('sends the expected metrics on render', async () => {
      renderWithLocalizationProvider(
        <Subject recoveryKeyExists={false} estimatedSyncDeviceCount={2} />
      );

      await waitFor(() =>
        expect(GleanMetrics.passwordReset.createNewView).toHaveBeenCalledTimes(
          1
        )
      );
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
        screen.queryByText('Your browser data may not be recovered')
      ).not.toBeInTheDocument();

      // Warning message about using recovery key should not be displayed
      expect(
        screen.queryByText('Reset your password and keep your data')
      ).not.toBeInTheDocument();

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      expect(screen.getByLabelText('New password')).toBeVisible();
      expect(screen.getByLabelText('Confirm password')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Create new password' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      const link = screen.getByRole('link', { name: 'Sign in' });
      expect(link).toBeVisible();
      // prefillEmail is passed as state from the LinkRememberPassword component
      expect(link).toHaveAttribute('href', '/');
      expect(
        screen.queryByRole('link', { name: 'Use account recovery key' })
      ).not.toBeInTheDocument();
    });

    it('sends the expected metrics on render', async () => {
      renderWithLocalizationProvider(<Subject hasConfirmedRecoveryKey />);

      await waitFor(() =>
        expect(
          GleanMetrics.passwordReset.recoveryKeyCreatePasswordView
        ).toHaveBeenCalledTimes(1)
      );
    });
  });

  describe('reset when account has a recovery key but user lost it', () => {
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

      // Warning messages about data loss should be displayed.
      expect(
        screen.queryByText('Your browser data may not be recovered')
      ).toBeInTheDocument();

      // Option to use recovery key should be displayed
      expect(screen.getByText('Have an account recovery key?')).toBeVisible();

      expect(
        screen.getByRole('link', { name: 'Use account recovery key' })
      ).toBeVisible();
    });
  });

  describe('reset when account has a recovery key but user lost the key and does not have synced devices', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(
        <Subject
          hasConfirmedRecoveryKey={false}
          recoveryKeyExists={true}
          estimatedSyncDeviceCount={0}
        />
      );

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create a new password',
          })
        ).toBeVisible()
      );

      // Warning is only shown to sync users
      expect(
        screen.queryByText('Your browser data may not be recovered')
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
        screen.queryByText('Your browser data may not be recovered')
      ).toBeInTheDocument();

      // Option to use recovery key should be displayed
      expect(screen.getByText('Have an account recovery key?')).toBeVisible();
    });
  });

  describe('submitting new password', () => {
    it('handles submit with valid password', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject submitNewPassword={mockSubmitNewPassword} />
      );

      await waitFor(() =>
        user.type(screen.getByLabelText('New password'), MOCK_PASSWORD)
      );
      await waitFor(() =>
        user.type(screen.getByLabelText('Confirm password'), MOCK_PASSWORD)
      );
      const button = screen.getByRole('button', {
        name: 'Create new password',
      });
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
});
