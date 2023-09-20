/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import ConfirmSignin, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('ConfirmSignin', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  // TODO: add tests for all metrics as they are added

  it("renders default view as expected with user's email", () => {
    renderWithLocalizationProvider(
      <ConfirmSignin email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm this sign-in');
    screen.getByText(
      `Check your email for the sign-in confirmation link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
  });

  it('resends the email when the user clicks the resend button', () => {
    renderWithLocalizationProvider(
      <ConfirmSignin email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm this sign-in');
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    fireEvent.click(resendEmailButton);
    // TO-DO: Once we know where this functionality is coming from, we'll be able to test it.
    // Add in a test to verify that it's called.
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(
      <ConfirmSignin email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
