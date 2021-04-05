/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import { Account, AccountContext } from '../../models';
import { getDefault } from '../../lib/config';
import Nav from '.';
import { ConfigContext } from 'fxa-settings/src/lib/config';

const account = ({
  primaryEmail: {
    email: 'stomlinson@mozilla.com',
  },
  subscriptions: [],
} as unknown) as Account;

describe('Nav', () => {
  it('renders as expected', () => {
    render(
      <AccountContext.Provider value={{ account }}>
        <ConfigContext.Provider value={getDefault()}>
          <Nav />
        </ConfigContext.Provider>
      </AccountContext.Provider>
    );

    expect(screen.getByTestId('nav-link-profile')).toHaveTextContent('Profile');
    expect(screen.getByTestId('nav-link-profile')).toHaveAttribute(
      'href',
      '#profile'
    );

    expect(screen.getByTestId('nav-link-security')).toHaveTextContent(
      'Security'
    );
    expect(screen.getByTestId('nav-link-security')).toHaveAttribute(
      'href',
      '#security'
    );

    expect(screen.getByTestId('nav-link-connected-services')).toHaveTextContent(
      'Connected Services'
    );
    expect(screen.getByTestId('nav-link-connected-services')).toHaveAttribute(
      'href',
      '#connected-services'
    );

    expect(screen.getByTestId('nav-link-newsletters')).toHaveTextContent(
      'Email Communications'
    );
    expect(screen.getByTestId('nav-link-newsletters')).toHaveAttribute(
      'href',
      `https://basket.mozilla.org/fxa/?email=${encodeURIComponent(
        'stomlinson@mozilla.com'
      )}`
    );

    expect(screen.queryByTestId('nav-link-subscriptions')).toBeNull();
  });

  it('renders as expected with subscriptions link', () => {
    const account = ({
      primaryEmail: {
        email: 'stomlinson@mozilla.com',
      },
      subscriptions: [{ created: 1, productName: 'x' }],
    } as unknown) as Account;
    render(
      <AccountContext.Provider value={{ account }}>
        <Nav />
      </AccountContext.Provider>
    );

    expect(screen.getByTestId('nav-link-subscriptions')).toHaveTextContent(
      'Paid Subscriptions'
    );
    expect(screen.getByTestId('nav-link-subscriptions')).toHaveAttribute(
      'href',
      '/subscriptions'
    );
  });

  it('renders as expected without newsletters link', () => {
    const config = Object.assign({}, getDefault(), {
      marketingEmailPreferencesUrl: '',
    });

    render(
      <AccountContext.Provider value={{ account }}>
        <ConfigContext.Provider value={config}>
          <Nav />
        </ConfigContext.Provider>
      </AccountContext.Provider>
    );

    expect(screen.queryByTestId('nav-link-newsletters')).toBeNull();
  });
});
