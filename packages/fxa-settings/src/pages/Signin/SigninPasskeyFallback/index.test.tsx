/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import SigninPasskeyFallback from '.';
import GleanMetrics from '../../../lib/glean';

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

  it('shows a banner when localizedErrorMessage is set', () => {
    renderWithRouter(
      <SigninPasskeyFallback
        email="user@example.com"
        localizedErrorMessage="Incorrect password"
      />
    );
    expect(screen.getByText('Incorrect password')).toBeInTheDocument();
  });

  it('for reason=resume, renders generic copy without the eyebrow or passkey metrics', () => {
    renderWithRouter(
      <SigninPasskeyFallback email="user@example.com" reason="resume" />
    );
    expect(
      screen.getByText(
        'Your password encrypts your synced data so only you can access it.'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/when you use this passkey/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Finish sign in')).not.toBeInTheDocument();
    expect(GleanMetrics.passkeyEnterPassword.view).not.toHaveBeenCalled();
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
