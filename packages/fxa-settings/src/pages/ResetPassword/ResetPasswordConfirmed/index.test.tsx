/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ResetPasswordConfirmed from '.';
import { MozServices } from '../../../lib/types';
import userEvent from '@testing-library/user-event';

const mockContinueHandler = jest.fn();

describe('ResetPasswordConfirmed', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(
      <ResetPasswordConfirmed
        continueHandler={mockContinueHandler}
        serviceName={MozServices.Monitor}
      />
    );
    expect(
      screen.getByText('Your password has been reset')
    ).toBeInTheDocument();
    const submitButton = screen.getByRole('button');
    expect(submitButton).toHaveTextContent('Continue to Mozilla Monitor');
    expect(submitButton).toHaveAttribute(
      'data-glean-id',
      'password_reset_success_continue_to_relying_party_submit'
    );
  });

  it('renders an error message when one is provided', async () => {
    const errorMessage = 'An error occurred';
    renderWithLocalizationProvider(
      <ResetPasswordConfirmed
        continueHandler={mockContinueHandler}
        serviceName={MozServices.Monitor}
        {...{ errorMessage }}
      />
    );
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles submit correctly', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <ResetPasswordConfirmed
        continueHandler={mockContinueHandler}
        serviceName={MozServices.Monitor}
      />
    );
    user.click(screen.getByRole('button'));
    await waitFor(() => expect(mockContinueHandler).toHaveBeenCalledTimes(1));
  });
});
