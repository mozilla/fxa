/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ResetPasswordConfirmed, { viewName } from '.';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { MozServices } from '../../../lib/types';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));
jest.mock('../../../lib/glean', () => ({
  passwordReset: {
    createNewSuccess: jest.fn(),
  },
}));

describe('ResetPasswordConfirmed', () => {
  async function renderResetPasswordConfirmed(
    props: {
      isSignedIn: boolean;
      serviceName: MozServices;
      continueHandler?: Function;
    } = {
      isSignedIn: false,
      serviceName: MozServices.Default,
    }
  ) {
    renderWithLocalizationProvider(<ResetPasswordConfirmed {...props} />);
    await waitFor(() => new Promise((r) => setTimeout(r, 100)));
  }

  it('renders Ready component as expected when signed in', async () => {
    await renderResetPasswordConfirmed({
      isSignedIn: true,
      serviceName: MozServices.Default,
    });
    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      'You’re now ready to use account settings'
    );
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    await renderResetPasswordConfirmed();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics when a user clicks `Continue`', async () => {
    await renderResetPasswordConfirmed({
      isSignedIn: false,
      serviceName: MozServices.Default,
      continueHandler: () => {},
    });
    const passwordResetContinueButton = screen.getByText('Continue');

    fireEvent.click(passwordResetContinueButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      `flow.${viewName}.continue`,
      REACT_ENTRYPOINT
    );
  });
});
