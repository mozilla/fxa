/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import LinkRememberPassword from '.';
import { MOCK_EMAIL } from './mocks';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

describe('LinkRememberPassword', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders', () => {
    render(<LinkRememberPassword />);
    testAllL10n(screen, bundle);

    expect(
      screen.getByRole('link', { name: 'Remember your password? Sign in' })
    ).toBeInTheDocument();
  });

  it('links to signin if `forceEmail` is not provided, and passes email as query param', () => {
    render(<LinkRememberPassword email={MOCK_EMAIL} />);

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
    fireEvent.click(rememberPasswordLink);

    expect(rememberPasswordLink).toHaveAttribute(
      'href',
      '/signin?email=bleep%40bloop.com'
    );
  });

  it('links to force_auth if `forceEmail` is provided, and passes forceEmail as query param', () => {
    render(<LinkRememberPassword forceEmail={MOCK_EMAIL} />);

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Remember your password? Sign in',
    });
    expect(rememberPasswordLink).toHaveAttribute(
      'href',
      '/force_auth?email=bleep%40bloop.com'
    );
  });
});
