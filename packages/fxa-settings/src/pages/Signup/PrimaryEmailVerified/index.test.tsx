/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import PrimaryEmailVerified, { viewName } from '.';
import { usePageViewEvent } from '../../../lib/metrics';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_SERVICE } from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('PrimaryEmailVerified page', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders the page as expected when the user is signed in', () => {
    renderWithLocalizationProvider(<PrimaryEmailVerified isSignedIn />);
    // testAllL10n(screen, bundle);

    screen.getByText('Primary email confirmed');
    screen.getByText('You’re now ready to use account settings');
    const signinContinueButton = screen.queryByText('Continue');
    expect(signinContinueButton).not.toBeInTheDocument();
  });

  it('renders the page as expected when the user is signed out', () => {
    renderWithLocalizationProvider(<PrimaryEmailVerified isSignedIn={false} />);
    // testAllL10n(screen, bundle);

    screen.getByText('Your account is ready!');
  });

  it('show the service name when it is passed in', () => {
    renderWithLocalizationProvider(
      <PrimaryEmailVerified isSignedIn serviceName={MOCK_SERVICE} />
    );

    screen.getByText(`You’re now ready to use ${MOCK_SERVICE}`);
  });

  it('emits the expected metrics on render', () => {
    renderWithLocalizationProvider(<PrimaryEmailVerified isSignedIn />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
