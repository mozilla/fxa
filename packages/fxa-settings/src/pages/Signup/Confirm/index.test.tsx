/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import Confirm, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('Confirm page', () => {
  // TODO: Enable l10n tests when FXA-6461 is resolved.
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  // TODO: add tests for all metrics as they are added

  it("renders default view as expected with user's email", () => {
    render(<Confirm email={MOCK_ACCOUNT.primaryEmail.email} />);
    // testAllL10n(screen, bundle, { email: MOCK_ACCOUNT.primaryEmail.email });

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm your account');
    screen.getByText(
      `Check your email for the confirmation link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
  });

  // TODO Enable testing when resend email function is added to the page
  // it('resends the email when the user clicks the resend button', () => {
  //   render(<Confirm email={MOCK_ACCOUNT.primaryEmail.email} />);
  //   const resendEmailButton = screen.getByRole('button', {
  //     name: 'Not in inbox or spam folder? Resend',
  //   });
  // });

  it('emits a metrics event on render', () => {
    render(<Confirm email={MOCK_ACCOUNT.primaryEmail.email} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
