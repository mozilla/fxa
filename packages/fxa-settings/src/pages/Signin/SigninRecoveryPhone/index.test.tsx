/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';
import SigninRecoveryPhone from './index';

describe('SigninRecoveryPhone', () => {
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
    numBackupCodes: 4,
  };

  const propsWithError = {
    lastFourPhoneDigits: '1234',
    verifyCode: mockVerifyCodeError,
    resendCode: mockResendCodeError,
    numBackupCodes: 4,
  };

  const propsWithErrorNoBackupCodes = {
    lastFourPhoneDigits: '1234',
    verifyCode: mockVerifyCodeError,
    resendCode: mockResendCodeError,
    numBackupCodes: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sign in' })
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
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    await waitFor(() => user.type(screen.getByRole('textbox'), '123456'));

    expect(screen.getByRole('button', { name: /Confirm/i })).toHaveAttribute(
      'data-glean-id',
      'login_backup_phone_submit'
    );

    const resendButton = screen.getByRole('button', { name: /Resend code/i });
    expect(resendButton).toHaveAttribute(
      'data-glean-id',
      'login_backup_phone_resend'
    );
    const lockedOutLink = screen.getByRole('link', {
      name: /Are you locked out\?/i,
    });
    expect(lockedOutLink).toHaveAttribute(
      'data-glean-id',
      'login_backup_phone_locked_out_link'
    );
  });

  it('submits with valid code', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    const input = screen.getByRole('textbox');

    await waitFor(() => userEvent.type(input, '123456'));
    userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('123456');
    });
  });

  it('handles invalid code with backup codes available', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...propsWithError} />);

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
    ).toHaveAttribute('href', '/signin_recovery_code');
  });

  it('handles invalid code without backup codes available', async () => {
    renderWithLocalizationProvider(
      <SigninRecoveryPhone {...propsWithErrorNoBackupCodes} />
    );

    const input = screen.getByRole('textbox');

    await waitFor(() => userEvent.type(input, '123456'));
    userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockVerifyCodeError).toHaveBeenCalledWith('123456');
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      /The code is invalid or expired./
    );
    // Should not show backup codes link when user has no backup codes
    expect(
      screen.queryByRole('link', {
        name: 'Use backup authentication codes instead?',
      })
    ).not.toBeInTheDocument();
  });

  it('handles resend code', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    userEvent.click(screen.getByRole('button', { name: 'Resend code' }));

    await waitFor(() => expect(mockResendCode).toHaveBeenCalled());
  });

  it('handles `Are you locked out?` link', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Are you locked out/i });
    expect(link).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication'
    );
  });
});
