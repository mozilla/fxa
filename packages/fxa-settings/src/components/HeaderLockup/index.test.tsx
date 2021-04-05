/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import { Account, AccountContext } from '../../models';
import HeaderLockup from '.';

// TODO: functional test for `data-testid="header-menu"` to be visible in
// mobile & tablet but hidden at desktop

const account = ({
  avatar: { url: null, id: null },
} as unknown) as Account;

describe('HeaderLockup', () => {
  it('renders as expected', () => {
    render(
      <AccountContext.Provider value={{ account }}>
        <MockedCache>
          <HeaderLockup />
        </MockedCache>
      </AccountContext.Provider>
    );

    expect(screen.getByTestId('header-sumo-link')).toHaveAttribute(
      'href',
      'https://support.mozilla.org'
    );
    expect(screen.getByTestId('header-help')).toBeInTheDocument();
    expect(
      screen.getByTestId('drop-down-bento-menu-toggle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('avatar-default')).toBeInTheDocument();

    expect(screen.getByTestId('header-menu')).toBeInTheDocument();
    expect(screen.getByTestId('back-to-top')).toHaveAttribute(
      'title',
      'Back to top'
    );
  });
});
