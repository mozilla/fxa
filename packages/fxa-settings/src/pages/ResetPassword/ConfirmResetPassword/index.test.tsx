// TODO in FXA-7890 import tests from previous design and update

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL } from '../../mocks';
import { ResendStatus } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';
import { LocationProvider } from '@reach/router';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      emailConfirmationView: jest.fn(),
      emailConfirmationDifferentAccount: jest.fn(),
      emailConfirmationSignin: jest.fn(),
    },
  },
}));

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook,
  };
});

const mockResendCode = jest.fn(() => Promise.resolve());
const mockVerifyCode = jest.fn((code: string) => Promise.resolve());

describe('ConfirmResetPassword', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    await expect(
      screen.getByRole('heading', { name: 'Check your email' })
    ).toBeVisible();

    expect(screen.getByText(MOCK_EMAIL)).toBeVisible();

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Continue');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toHaveTextContent('Resend code');

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAccessibleName(/Mozilla logo/);
    expect(links[1]).toHaveTextContent('Sign in');
    expect(links[2]).toHaveTextContent('Use a different account');
  });

  it('emits the expected metrics event on render', async () => {
    renderWithLocalizationProvider(<Subject />);

    await expect(
      screen.getByRole('heading', { name: 'Check your email' })
    ).toBeVisible();

    expect(
      GleanMetrics.passwordReset.emailConfirmationView
    ).toHaveBeenCalledTimes(1);
  });

  it('submits with valid code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject verifyCode={mockVerifyCode} />);

    const textboxes = screen.getAllByRole('textbox');
    await waitFor(() => user.click(textboxes[0]));
    await waitFor(() => {
      user.paste('12345678');
    });

    const submitButton = screen.getByRole('button', {
      name: 'Continue',
    });
    expect(submitButton).toBeEnabled();

    await waitFor(() => user.click(submitButton));
    expect(mockVerifyCode).toHaveBeenCalledTimes(1);
    expect(mockVerifyCode).toHaveBeenCalledWith('12345678');
  });

  it('handles click on signin', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject />);

    const signinLink = screen.getByRole('link', {
      name: 'Sign in',
    });

    await waitFor(() => user.click(signinLink));
    expect(
      GleanMetrics.passwordReset.emailConfirmationSignin
    ).toHaveBeenCalledTimes(1);
  });

  it('handles resend code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject resendCode={mockResendCode} />);

    const resendButton = screen.getByRole('button', {
      name: 'Resend code',
    });

    await waitFor(() => user.click(resendButton));
    expect(mockResendCode).toHaveBeenCalledTimes(1);
  });

  it('handles Use different account link', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() =>
      user.click(screen.getByRole('link', { name: /^Use a different account/ }))
    );
    expect(mockNavigateHook).toHaveBeenCalledWith('/', {
      state: { prefillEmail: MOCK_EMAIL },
    });
    expect(
      GleanMetrics.passwordReset.emailConfirmationDifferentAccount
    ).toHaveBeenCalledTimes(1);
  });

  describe('banners', () => {
    it('shows resend success banner', async () => {
      renderWithLocalizationProvider(
        <Subject resendStatus={ResendStatus.sent} />
      );

      await expect(
        screen.getByText(/A new code was sent to your email./)
      ).toBeVisible();
    });

    it('shows resend error banner', async () => {
      renderWithLocalizationProvider(
        <LocationProvider>
          <Subject
            resendStatus={ResendStatus.error}
            resendErrorMessage="Something went wrong. Please try again."
          />
        </LocationProvider>
      );

      await expect(
        screen.getByText('Something went wrong. Please try again.')
      ).toBeVisible();
    });
  });
});
