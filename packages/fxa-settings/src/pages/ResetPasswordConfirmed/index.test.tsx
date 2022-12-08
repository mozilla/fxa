/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ResetPasswordConfirmed from '.';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('ResetPasswordConfirmed', () => {
  it('renders Ready component as expected', () => {
    render(<ResetPasswordConfirmed />);

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      'You’re now ready to use Account Settings'
    );
    const passwordResetContinueButton = screen.queryByText('Continue');

    expect(passwordResetContinueButton).not.toBeInTheDocument();
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    render(<ResetPasswordConfirmed />);
    expect(usePageViewEvent).toHaveBeenCalledWith(
      'settings.reset-password-confirmed',
      {
        entrypoint_variation: 'react',
      }
    );
  });

  it('emits the expected metrics when a user clicks `Continue`', async () => {
    render(
      <ResetPasswordConfirmed
        continueHandler={() => {
          console.log('beepboop');
        }}
      />
    );
    const passwordResetContinueButton = screen.getByText('Continue');

    fireEvent.click(passwordResetContinueButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.reset-password-confirmed.continue',
      'reset_password_confirmed_continue',
      {
        entrypoint_variation: 'react',
      }
    );
  });
});
