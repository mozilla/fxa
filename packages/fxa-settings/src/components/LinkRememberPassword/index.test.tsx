/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import LinkRememberPassword from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

describe('LinkRememberPassword', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders', () => {
    renderWithLocalizationProvider(
      <LinkRememberPassword email={MOCK_ACCOUNT.primaryEmail.email} />
    );
    testAllL10n(screen, bundle);

    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('links to signin if not forceAuth', () => {
    renderWithLocalizationProvider(
      <LinkRememberPassword email={MOCK_ACCOUNT.primaryEmail.email} />
    );

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
    fireEvent.click(rememberPasswordLink);

    expect(rememberPasswordLink).toHaveAttribute(
      'href',
      '/signin?email=johndope%40example.com'
    );
  });

  it('links to force_auth if forceAuth is true', () => {
    renderWithLocalizationProvider(
      <LinkRememberPassword email={MOCK_ACCOUNT.primaryEmail.email} forceAuth />
    );

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
    expect(rememberPasswordLink).toHaveAttribute(
      'href',
      '/force_auth?email=johndope%40example.com'
    );
  });
});
