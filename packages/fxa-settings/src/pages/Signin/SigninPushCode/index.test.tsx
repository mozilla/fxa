/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MozServices } from '../../../lib/types';
import { Subject } from './mocks';

const mockLocation = () => {
  return {
    pathname: '/signin_push_cpde',
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useLocation: () => mockLocation(),
}));

describe('Sign in with push notification code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Verify this login to continue to account settings'
    );
    screen.getByText(
      'Please check your other devices and approve this login from your Firefox browser.'
    );

    screen.getByText('Didn’t receive the notification?');
    screen.getByRole('link', { name: 'Email code' });
  });

  it('shows the relying party in the header when a service name is provided', () => {
    renderWithLocalizationProvider(
      <Subject
        {...{
          serviceName: MozServices.MozillaVPN,
        }}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Verify this login to continue to Mozilla VPN'
    );
  });
});
