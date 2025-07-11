/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import HeaderLockup from '.';
import { userEvent } from '@testing-library/user-event';
import GleanMetrics from '../../../lib/glean';
import { renderWithRouter } from '../../../models/mocks';
import { createHistory, createMemorySource } from '@reach/router';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      help: jest.fn(),
    },
  },
}));

describe('HeaderLockup', () => {
  it('renders as expected on other settings pages', () => {
    renderWithRouter(<HeaderLockup />, {
      route: '/settings/emails',
      history: createHistory(createMemorySource('/settings/emails')),
    });

    const headerMenu = screen.getByTestId('header-menu');

    expect(
      screen.getByTestId('drop-down-bento-menu-toggle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument();

    expect(headerMenu).toBeInTheDocument();
    expect(headerMenu).toHaveAttribute('title', 'Site navigation menu');

    expect(
      screen.getByRole('link', { name: 'Help Opens in new window' })
    ).toHaveAttribute(
      'href',
      'https://support.mozilla.org/products/mozilla-account'
    );
    const logo = screen.getByTestId('back-to-settings');
    expect(logo).toHaveAttribute('title', 'Back to Mozilla account settings');
    expect(logo).toHaveAttribute('href', '/settings');
  });

  it('shows the correct tooltip when at the top-level /settings route', () => {
    renderWithRouter(<HeaderLockup />, {
      route: '/settings',
      history: createHistory(createMemorySource('/settings')),
    });

    const logo = screen.getByTestId('back-to-settings');
    expect(logo).toHaveAttribute('title', 'Back to top');
    expect(logo).toHaveAttribute('href', '/settings');
  });

  it('emits Glean event on help link click', async () => {
    renderWithRouter(<HeaderLockup />);
    await userEvent.click(
      screen.getByRole('link', { name: 'Help Opens in new window' })
    );
    expect(GleanMetrics.accountPref.help).toHaveBeenCalled();
  });
});
