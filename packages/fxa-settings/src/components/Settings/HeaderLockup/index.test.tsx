/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import HeaderLockup from '.';
import { createMockSettingsIntegration } from '../mocks';

// TODO: functional test for `data-testid="header-menu"` to be visible in
// mobile & tablet but hidden at desktop

describe('HeaderLockup', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <HeaderLockup integration={createMockSettingsIntegration()} />
    );
    const headerHelp = screen.getByTestId('header-help');
    const headerMenu = screen.getByTestId('header-menu');

    expect(screen.getByTestId('header-sumo-link')).toHaveAttribute(
      'href',
      'https://support.mozilla.org'
    );
    expect(headerHelp).toBeInTheDocument();
    expect(headerHelp).toHaveAttribute('title', 'Help');

    expect(
      screen.getByTestId('drop-down-bento-menu-toggle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument();

    expect(headerMenu).toBeInTheDocument();
    expect(headerMenu).toHaveAttribute('title', 'Site navigation menu');

    expect(screen.getByTestId('back-to-top')).toHaveAttribute(
      'title',
      'Back to top'
    );
  });
});
