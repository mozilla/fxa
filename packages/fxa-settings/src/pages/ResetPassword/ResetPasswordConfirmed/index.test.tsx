/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ResetPasswordConfirmed, { viewName } from '.';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../models/hooks', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../models/hooks'),
    useRelier: () => ({
      isSync() {
        return false;
      },
      getServiceName() {
        return 'account settings';
      },
    }),
  };
});

describe('ResetPasswordConfirmed', () => {
  async function renderResetPasswordConfirmed(params: {
    isSignedIn: boolean;
    continueHandler?: Function;
  }) {
    renderWithLocalizationProvider(<ResetPasswordConfirmed {...params} />);
    await waitFor(() => new Promise((r) => setTimeout(r, 100)));
  }

  it('renders Ready component as expected', async () => {
    await renderResetPasswordConfirmed({ isSignedIn: true });
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
    await renderResetPasswordConfirmed({ isSignedIn: false });
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics when a user clicks `Continue`', async () => {
    await renderResetPasswordConfirmed({
      isSignedIn: false,
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
