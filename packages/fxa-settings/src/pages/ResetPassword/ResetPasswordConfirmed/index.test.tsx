/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ResetPasswordConfirmed, { viewName } from '.';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('ResetPasswordConfirmed', () => {
  it('renders Ready component as expected', () => {
    render(<ResetPasswordConfirmed isSignedIn isSync={false} />);
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
    render(<ResetPasswordConfirmed isSignedIn isSync={false} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics when a user clicks `Continue`', () => {
    render(
      <ResetPasswordConfirmed
        isSignedIn
        isSync={false}
        continueHandler={() => {
          console.log('beepboop');
        }}
      />
    );
    const passwordResetContinueButton = screen.getByText('Continue');

    fireEvent.click(passwordResetContinueButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      `flow.${viewName}.continue`,
      REACT_ENTRYPOINT
    );
  });
});
