/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { ModalMfaProtected } from '.';
import { MOCK_EMAIL } from '../../../pages/mocks';
import { MfaReason } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';

const defaultProps = {
  email: MOCK_EMAIL,
  expirationTime: 5,
  onSubmit: () => {},
  onDismiss: () => {},
  handleResendCode: () => {},
  clearErrorMessage: () => {},
  resendCodeLoading: false,
  showResendSuccessBanner: false,
  reason: MfaReason.test,
};

describe('ModalMfaProtected', () => {
  it('renders correctly', () => {
    renderWithRouter(<ModalMfaProtected {...defaultProps} />);

    expect(screen.getByText('Enter confirmation code')).toBeInTheDocument();
    expect(
      screen.getByText('Help us make sure it’s you changing your account info')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Enter the code that was sent to/)
    ).toHaveTextContent(
      `Enter the code that was sent to ${MOCK_EMAIL} within 5 minutes.`
    );
    expect(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('modal-dismiss')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByText('Code expired?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Email new code.' })
    ).toBeInTheDocument();
  });

  it('has correct metrics', async () => {
    const viewSpy = jest.spyOn(GleanMetrics.accountPref, 'mfaGuardView');
    renderWithRouter(<ModalMfaProtected {...defaultProps} />);
    await waitFor(() => {
      expect(viewSpy).toHaveBeenCalledWith({
        event: { reason: MfaReason.test },
      });
    });
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute(
      'data-glean-id',
      'account_pref_mfa_guard_submit'
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute(
      'data-glean-type',
      MfaReason.test
    );
  });

  it('handles form submission', async () => {
    const onSubmit = jest.fn();
    renderWithRouter(
      <ModalMfaProtected {...defaultProps} onSubmit={onSubmit} />
    );

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter 6-digit code' }),
      '123456'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onSubmit).toHaveBeenCalledWith('123456');
  });

  it('calls handleResendCode when Email new code button is clicked', async () => {
    const handleResendCode = jest.fn();
    renderWithRouter(
      <ModalMfaProtected
        {...defaultProps}
        handleResendCode={handleResendCode}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Email new code.' })
    );

    expect(handleResendCode).toHaveBeenCalled();
  });

  it('calls onDismiss when the close button is clicked', async () => {
    const onDismiss = jest.fn();
    renderWithRouter(
      <ModalMfaProtected {...defaultProps} onDismiss={onDismiss} />
    );

    await userEvent.click(screen.getByTestId('modal-dismiss'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss when the cancel button is clicked', async () => {
    const onDismiss = jest.fn();
    renderWithRouter(
      <ModalMfaProtected {...defaultProps} onDismiss={onDismiss} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('displays error banner', () => {
    renderWithRouter(
      <ModalMfaProtected
        {...defaultProps}
        localizedErrorBannerMessage="error banner"
      />
    );
    expect(screen.getByText('error banner')).toBeInTheDocument();
  });

  it('shows code resend success banner', () => {
    renderWithRouter(
      <ModalMfaProtected {...defaultProps} showResendSuccessBanner={true} />
    );
    expect(
      screen.getByText('A new code was sent to your email.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      )
    ).toBeInTheDocument();
  });
});
