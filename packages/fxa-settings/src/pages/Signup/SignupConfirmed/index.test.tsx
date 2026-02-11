/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n, testL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import SignupConfirmed, { viewName } from '.';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const continueHandler = jest.fn();

describe('SignupConfirmed', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders Ready component as expected', () => {
    renderWithLocalizationProvider(<SignupConfirmed isSignedIn />);
    // testAllL10n(screen, bundle);

    const signupConfirmation = screen.getByText('Account confirmed');
    const serviceAvailabilityConfirmation = screen.getByText(
      'You’re now ready to use account settings'
    );
    const signupContinueButton = screen.queryByText('Continue');
    // Calling `getByText` will fail if these elements aren't in the document,
    // but we test anyway to make the intention of the test explicit
    expect(signupContinueButton).not.toBeInTheDocument();
    expect(signupConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    renderWithLocalizationProvider(<SignupConfirmed isSignedIn />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics when a user clicks `Continue`', () => {
    renderWithLocalizationProvider(
      <SignupConfirmed isSignedIn {...{ continueHandler }} />
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
