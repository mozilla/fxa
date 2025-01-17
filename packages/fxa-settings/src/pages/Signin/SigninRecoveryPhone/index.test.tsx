import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import SigninRecoveryPhone from './index';

describe('SigninRecoveryPhone', () => {
  const mockVerifyCode = jest.fn(() => Promise.resolve());
  const mockResendCode = jest.fn(() => Promise.resolve());

  const defaultProps = {
    lastFourPhoneDigits: '1234',
    verifyCode: mockVerifyCode,
    resendCode: mockResendCode,
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

  it('submits with valid code', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      await userEvent.type(input, '123456');
      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    });

    expect(mockVerifyCode).toHaveBeenCalledWith('123456');
  });

  it('handles resend code', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole('button', { name: 'Resend code' })
      );
    });

    expect(mockResendCode).toHaveBeenCalled();
  });

  it('handles `Are you locked out?` link', async () => {
    renderWithLocalizationProvider(<SigninRecoveryPhone {...defaultProps} />);

    const link = screen.getByRole('link', {
      name: 'Are you locked out? Opens in new window',
    });
    expect(link).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication'
    );
  });
});
