/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlowSetupRecoveryPhoneConfirmCode from '.';
import '@testing-library/jest-dom';
import { MOCK_NATIONAL_FORMAT_PHONE_NUMBER } from '../../../pages/mocks';

jest.mock('../../../lib/error-utils', () => ({
  getLocalizedErrorMessage: jest.fn(() => 'Localized error message'),
}));

jest.mock('../../../models', () => ({
  useAlertBar: jest.fn(() => ({
    success: jest.fn(),
  })),
  useFtlMsgResolver: jest.fn(() => ({
    getMsg: (id: string, fallback: string) => fallback,
  })),
}));

const mockNavigateBackward = jest.fn();
const mockNavigateForward = jest.fn();
const mockSendCode = jest.fn();
const mockVerifyRecoveryCode = jest.fn();

const defaultProps = {
  localizedBackButtonTitle: 'Back',
  localizedPageTitle: 'Add phone number',
  navigateBackward: mockNavigateBackward,
  navigateForward: mockNavigateForward,
  nationalFormatPhoneNumber: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
  sendCode: mockSendCode,
  verifyRecoveryCode: mockVerifyRecoveryCode,
};

describe('FlowSetupRecoveryPhoneConfirmCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component correctly', () => {
    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: /Enter verification code/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/A 6-digit code was sent to/i)).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 555-1234/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Resend code/i })
    ).toBeInTheDocument();
    const disabledSubmitButton = screen.getByRole('button', {
      name: /Confirm/i,
    });
    expect(disabledSubmitButton).toBeInTheDocument();
    expect(disabledSubmitButton).toBeDisabled();
  });

  test('enables submit button when code is entered', async () => {
    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    // when code in input field is empty or incomplete
    // a title is added to the button to indicate to the user to enter the code
    const input = screen.getByLabelText(/Enter 6-digit code/i);
    await waitFor(() =>
      fireEvent.change(input, { target: { value: '123456' } })
    );

    // submit button is enabled, the accessible button text becomes the button text without the title
    const submitButton = screen.getByRole('button', {
      name: /Confirm/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  test('handles resend code action successfully', async () => {
    mockSendCode.mockResolvedValueOnce(undefined);

    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Resend code/i }));

    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Code sent/i)).toBeInTheDocument();
    });
  });

  test('handles error when resending code', async () => {
    mockSendCode.mockRejectedValueOnce(new Error('Network error'));

    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Resend code/i }));

    await waitFor(() => {
      expect(screen.getByText(/Localized error message/i)).toBeInTheDocument();
    });
  });

  test('handles successful verification code submission', async () => {
    mockVerifyRecoveryCode.mockResolvedValueOnce(undefined);

    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    const input = screen.getByLabelText(/Enter 6-digit code/i);
    await waitFor(() =>
      fireEvent.change(input, { target: { value: '123456' } })
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('123456');
      expect(mockNavigateForward).toHaveBeenCalledTimes(1);
    });
  });

  test('handles error during verification code submission', async () => {
    mockVerifyRecoveryCode.mockRejectedValueOnce(new Error('Invalid code'));

    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    const input = screen.getByLabelText(/Enter 6-digit code/i);
    await waitFor(() =>
      fireEvent.change(input, { target: { value: '654321' } })
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('654321');
      expect(screen.getByText(/Localized error message/i)).toBeInTheDocument();
    });
  });

  test('navigates backward when back button is clicked', () => {
    render(<FlowSetupRecoveryPhoneConfirmCode {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));

    expect(mockNavigateBackward).toHaveBeenCalledTimes(1);
  });
});
