/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ResetPasswordConfirmed from '.';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';

jest.mock('../../../lib/metrics', () => ({
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
      'You’re now ready to use account settings'
    );
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    render(<ResetPasswordConfirmed />);
    expect(usePageViewEvent).toHaveBeenCalledWith('reset-password-confirmed', {
      entrypoint_variation: 'react',
    });
  });

  it('emits the expected metrics when a user clicks `Continue`', () => {
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
      'reset-password-confirmed',
      'reset-password-confirmed.continue',
      {
        entrypoint_variation: 'react',
      }
    );
  });
});
