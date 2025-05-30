/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ResetPasswordRecoveryPhone from './index';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';

describe('ResetPasswordRecoveryPhone', () => {
  const mockVerifyCode = jest.fn(() => Promise.resolve());
  const mockVerifyCodeError = jest.fn(() =>
    Promise.resolve(AuthUiErrors.INVALID_EXPIRED_OTP_CODE as HandledError)
  );
  const mockResendCode = jest.fn(() => Promise.resolve());
  const mockResendCodeError = jest.fn(() =>
    Promise.resolve(AuthUiErrors.UNEXPECTED_ERROR as HandledError)
  );

  const defaultProps = {
    lastFourPhoneDigits: '1234',
    verifyCode: mockVerifyCode,
    resendCode: mockResendCode,
  };

  const propsWithError = {
    lastFourPhoneDigits: '1234',
    verifyCode: mockVerifyCodeError,
    resendCode: mockResendCodeError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Reset your password' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Enter recovery code' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' })
    ).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Resend code' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Are you locked out? Opens in new window',
      })
    ).toBeInTheDocument();
  });

  it('has expected glean click events', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...defaultProps} />);

    await waitFor(() => user.type(screen.getByRole('textbox'), '123456'));

    expect(screen.getByRole('button', { name: /Confirm/i })).toHaveAttribute(
      'data-glean-id',
      'reset_password_backup_phone_submit'
    );

    const resendButton = screen.getByRole('button', { name: /Resend code/i });
    expect(resendButton).toHaveAttribute(
      'data-glean-id',
      'reset_password_backup_phone_resend'
    );
    const lockedOutLink = screen.getByRole('link', {
      name: /Are you locked out\?/i,
    });
    expect(lockedOutLink).toHaveAttribute(
      'data-glean-id',
      'reset_password_backup_phone_locked_out_link'
    );
  });

  it('submits with valid code', async () => {
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...defaultProps} />);

    const input = screen.getByRole('textbox');

    await waitFor(() => userEvent.type(input, '123456'));
    userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('123456');
    });
  });

  it('handles invalid code', async () => {
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...propsWithError} />);

    const input = screen.getByRole('textbox');

    await waitFor(() => userEvent.type(input, '123456'));
    userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockVerifyCodeError).toHaveBeenCalledWith('123456');
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      /The code is invalid or expired./
    );
    expect(
      screen.getByRole('link', {
        name: 'Use backup authentication codes instead?',
      })
    ).toHaveAttribute('href', '/confirm_backup_code_reset_password');
  });

  it('handles resend code', async () => {
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...defaultProps} />);

    userEvent.click(screen.getByRole('button', { name: 'Resend code' }));

    await waitFor(() => expect(mockResendCode).toHaveBeenCalled());
  });

  it('handles `Are you locked out?` link', async () => {
    renderWithLocalizationProvider(<ResetPasswordRecoveryPhone {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Are you locked out/i });
    expect(link).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication'
    );
  });
});
