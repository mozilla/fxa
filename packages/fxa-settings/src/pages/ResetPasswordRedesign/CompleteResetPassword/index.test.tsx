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
    resetPassword: {
      createNewView: jest.fn(),
      recoveryKeyCreatePasswordView: jest.fn(),
    },
  },
}));

describe('CompleteResetPassword page', () => {
  beforeEach(() => {
    (GleanMetrics.resetPassword.createNewView as jest.Mock).mockClear();
    (
      GleanMetrics.resetPassword.recoveryKeyCreatePasswordView as jest.Mock
    ).mockClear();
    mockSubmitNewPassword.mockClear();
  });

  describe('default reset without recovery key', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(<Subject />);

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create new password',
          })
        ).toBeVisible()
      );
      expect(
        screen.getByText(
          'When you reset your password, you reset your account. You may lose some of your personal information (including history, bookmarks, and passwords). That’s because we encrypt your data with your password to protect your privacy. You’ll still keep any subscriptions you may have and Pocket data will not be affected.'
        )
      ).toBeVisible();
      // no recovery key specific messaging
      expect(
        screen.queryByText(
          'You have successfully restored your account using your account recovery key. Create a new password to secure your data, and store it in a safe location.'
        )
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
        `/signin?email=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });

    it('sends the expected metrics on render', () => {
      renderWithLocalizationProvider(<Subject />);
      expect(GleanMetrics.resetPassword.createNewView).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset with account recovery key confirmed', () => {
    it('renders as expected', async () => {
      renderWithLocalizationProvider(<Subject hasConfirmedRecoveryKey />);

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: 'Create new password',
          })
        ).toBeVisible()
      );
      // recovery key specific messaging
      expect(
        screen.getByText(
          'You have successfully restored your account using your account recovery key. Create a new password to secure your data, and store it in a safe location.'
        )
      ).toBeVisible();
      // no warning
      expect(
        screen.queryByText(
          'When you reset your password, you reset your account. You may lose some of your personal information (including history, bookmarks, and passwords). That’s because we encrypt your data with your password to protect your privacy. You’ll still keep any subscriptions you may have and Pocket data will not be affected.'
        )
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
        `/signin?email=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });

    it('sends the expected metrics on render', () => {
      renderWithLocalizationProvider(<Subject hasConfirmedRecoveryKey />);
      expect(
        GleanMetrics.resetPassword.recoveryKeyCreatePasswordView
      ).toHaveBeenCalledTimes(1);
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
          name: 'Create new password',
        })
      ).toBeVisible()
    );
    expect(screen.getByText('Something went wrong')).toBeVisible();
  });
});
