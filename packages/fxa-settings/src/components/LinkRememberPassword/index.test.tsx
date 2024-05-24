/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import LinkRememberPassword from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { MOCK_CLIENT_ID, MOCK_EMAIL } from '../../pages/mocks';
import { LocationProvider } from '@reach/router';

const mockLocation = () => {
  return {
    search: '?' + new URLSearchParams({ client_id: MOCK_CLIENT_ID }),
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => mockLocation(),
}));

const Subject = ({ email = MOCK_ACCOUNT.primaryEmail.email }) => (
  <LocationProvider>
    <LinkRememberPassword {...{ email }} />
  </LocationProvider>
);

describe('LinkRememberPassword', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    testAllL10n(screen, bundle);

    expect(screen.getByText('Remember your password?')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  it('links to index and appends parameters', async () => {
    renderWithLocalizationProvider(<Subject />);

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Sign in',
    });

    expect(rememberPasswordLink).toHaveAttribute(
      'href',
      `/?client_id=123&prefillEmail=${encodeURIComponent(MOCK_EMAIL)}`
    );
  });
});
