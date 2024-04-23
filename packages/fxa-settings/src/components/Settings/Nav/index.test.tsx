/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Account, AppContext } from '../../../models';
import { getDefault } from '../../../lib/config';
import Nav from '.';

const account = {
  primaryEmail: {
    email: 'stomlinson@mozilla.com',
  },
  subscriptions: [],
  linkedAccounts: [],
} as unknown as Account;

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('Nav', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <AppContext.Provider value={{ account, config: getDefault() }}>
        <Nav />
      </AppContext.Provider>
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

    expect(screen.getByTestId('nav-link-data-collection')).toHaveTextContent(
      'Data Collection and Use'
    );
    expect(screen.getByTestId('nav-link-data-collection')).toHaveAttribute(
      'href',
      '#data-collection'
    );
  });

  it('renders as expected with subscriptions link', () => {
    const account = {
      primaryEmail: {
        email: 'stomlinson@mozilla.com',
      },
      subscriptions: [{ created: 1, productName: 'x' }],
      linkedAccounts: [],
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={{ account }}>
        <Nav />
      </AppContext.Provider>
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

    renderWithLocalizationProvider(
      <AppContext.Provider value={{ account, config }}>
        <Nav />
      </AppContext.Provider>
    );

    expect(screen.queryByTestId('nav-link-newsletters')).toBeNull();
  });

  it('renders as expected with linkedAccounts link', () => {
    const account = {
      primaryEmail: {
        email: 'stomlinson@mozilla.com',
      },
      subscriptions: [{ created: 1, productName: 'x' }],
      linkedAccounts: [
        {
          providerId: 1,
        },
      ],
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={{ account }}>
        <Nav />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('nav-link-linked-accounts')).toHaveTextContent(
      'Linked Accounts'
    );
    expect(screen.getByTestId('nav-link-linked-accounts')).toHaveAttribute(
      'href',
      '#linked-accounts'
    );
  });
});
