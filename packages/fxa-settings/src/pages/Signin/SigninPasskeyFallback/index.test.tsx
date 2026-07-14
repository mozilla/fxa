/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import SigninPasskeyFallback from '.';
import GleanMetrics from '../../../lib/glean';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passkeyEnterPassword: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      submitFrontendError: jest.fn(),
      success: jest.fn(),
    },
  },
}));

describe('SigninPasskeyFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email, heading, password field, and continue button', () => {
    renderWithRouter(<SigninPasskeyFallback email="user@example.com" />);
    expect(screen.getByText('Enter your password to sync')).toBeInTheDocument();
    expect(screen.getByTestId('passkey-fallback-email')).toHaveTextContent(
      'user@example.com'
    );
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
  });

  it('calls onContinue with the entered password', async () => {
    const user = userEvent.setup();
    const onContinue = jest.fn().mockResolvedValue(undefined);
    renderWithRouter(
      <SigninPasskeyFallback email="user@example.com" onContinue={onContinue} />
    );
    await user.type(screen.getByLabelText('Password'), 'hunter2-the-sequel');
    await user.click(screen.getByTestId('continue-button'));
    expect(onContinue).toHaveBeenCalledWith('hunter2-the-sequel');
  });

  describe('password error handling', () => {
    const incorrectPassword = {
      errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
      localizedErrorMessage: 'Incorrect password',
    };
    const passwordField = () => screen.getByTestId('password-input-field');
    const continueButton = () => screen.getByTestId('continue-button');

    it('shows a validation tooltip and does not call onContinue when submitted empty', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(undefined);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.click(continueButton());
      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        'Valid password required'
      );
      expect(onContinue).not.toHaveBeenCalled();
    });

    it('shows an incorrect-password error in the field tooltip, not the banner', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(incorrectPassword);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.type(passwordField(), 'wrong-password');
      await user.click(continueButton());
      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        'Incorrect password'
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('disables Continue after an incorrect password until the field is edited', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(incorrectPassword);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.type(passwordField(), 'wrong-password');
      await user.click(continueButton());
      await screen.findByTestId('tooltip');
      expect(continueButton()).toBeDisabled();

      await user.type(passwordField(), '!');
      expect(continueButton()).toBeEnabled();
    });

    it('clears the tooltip when the password is edited', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(incorrectPassword);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.type(passwordField(), 'wrong-password');
      await user.click(continueButton());
      expect(await screen.findByTestId('tooltip')).toBeInTheDocument();

      await user.type(passwordField(), '!');
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    });

    it('does not resubmit the same password until it is edited', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(incorrectPassword);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.type(passwordField(), 'wrong-password');
      await user.click(continueButton());
      await screen.findByTestId('tooltip');

      await user.click(continueButton());
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('shows a non-password error in the banner and keeps Continue enabled', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue({
        errno: AuthUiErrors.UNEXPECTED_ERROR.errno,
        localizedErrorMessage: 'Something went wrong',
      });
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
        />
      );
      await user.type(passwordField(), 'some-password');
      await user.click(continueButton());
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Something went wrong'
      );
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
      expect(continueButton()).toBeEnabled();
    });
  });

  describe('Glean events', () => {
    it('fires view with the default surface reason on mount', () => {
      renderWithRouter(<SigninPasskeyFallback email="user@example.com" />);
      expect(GleanMetrics.passkeyEnterPassword.view).toHaveBeenCalledWith({
        event: { reason: 'emailfirst' },
      });
    });

    it('fires view with the provided surface reason', () => {
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          passkeySurface="signin"
        />
      );
      expect(GleanMetrics.passkeyEnterPassword.view).toHaveBeenCalledWith({
        event: { reason: 'signin' },
      });
    });

    it('fires engage on the first keystroke and not again', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          passkeySurface="signin"
        />
      );
      await user.type(screen.getByLabelText('Password'), 'a');
      await waitFor(() => {
        expect(GleanMetrics.passkeyEnterPassword.engage).toHaveBeenCalledWith({
          event: { reason: 'signin' },
        });
      });
      const callsBefore = (
        GleanMetrics.passkeyEnterPassword.engage as jest.Mock
      ).mock.calls.length;
      await user.type(screen.getByLabelText('Password'), 'b');
      expect(
        (GleanMetrics.passkeyEnterPassword.engage as jest.Mock).mock.calls
          .length
      ).toBe(callsBefore);
    });

    it('fires submit with the surface reason on form submission', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn().mockResolvedValue(undefined);
      renderWithRouter(
        <SigninPasskeyFallback
          email="user@example.com"
          onContinue={onContinue}
          passkeySurface="emailfirst"
        />
      );
      await user.type(screen.getByLabelText('Password'), 'shhh');
      await user.click(screen.getByTestId('continue-button'));
      expect(GleanMetrics.passkeyEnterPassword.submit).toHaveBeenCalledWith({
        event: { reason: 'emailfirst' },
      });
    });
  });
});
