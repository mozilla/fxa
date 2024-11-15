/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import HeaderLockup from '.';
import { userEvent } from '@testing-library/user-event';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      help: jest.fn(),
    },
  },
}));

describe('HeaderLockup', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<HeaderLockup />);
    const headerMenu = screen.getByTestId('header-menu');

    expect(
      screen.getByTestId('drop-down-bento-menu-toggle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument();

    expect(headerMenu).toBeInTheDocument();
    expect(headerMenu).toHaveAttribute('title', 'Site navigation menu');

    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/products/mozilla-account'
    );
    expect(screen.getByTestId('back-to-top')).toHaveAttribute(
      'title',
      'Back to top'
    );
  });

  it('emits Glean event on help link click', async () => {
    renderWithLocalizationProvider(<HeaderLockup />);
    await userEvent.click(screen.getByRole('link', { name: 'Help' }));
    expect(GleanMetrics.accountPref.help).toHaveBeenCalled();
  });
});
