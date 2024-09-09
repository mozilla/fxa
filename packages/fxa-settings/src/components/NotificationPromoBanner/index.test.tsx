/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import NotificationPromoBanner from '.';
import keyImage from './key.svg';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => {
    return {
      search: '?',
    };
  },
}));

describe('NotificationPromoBanner component', () => {
  it('renders as expected', () => {
    const notificationProps = {
      headerImage: keyImage,
      ctaText: 'Create',
      headerValue: 'Don’t lose your data if you forget your password',
      headerDescription:
        'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.',
      route: '/settings/account_recovery',
      dismissKey: 'account-recovery-dismissed',
      metricsPrefix: 'account-recovery',
      isVisible: true,
    };
    renderWithLocalizationProvider(
      <NotificationPromoBanner {...notificationProps} />
    );
    screen.getByText('Create');
    screen.getByText('Don’t lose your data if you forget your password');
    screen.getByText(
      'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.'
    );
  });

  it('can be dismissed', () => {
    const notificationProps = {
      headerImage: keyImage,
      ctaText: 'Create',
      headerValue: 'Don’t lose your data if you forget your password',
      headerDescription:
        'Create an Account Recovery Key to restore your sync browsing data if you ever forget your password.',
      route: '/settings/account_recovery',
      dismissKey: 'account-recovery-dismissed',
      metricsPrefix: 'account-recovery',
      isVisible: true,
    };
    renderWithLocalizationProvider(
      <NotificationPromoBanner {...notificationProps} />
    );

    let key = localStorage.getItem(
      '__fxa_storage.fxa_disable_notification_banner.account-recovery-dismissed'
    );
    expect(key).toBeNull();

    fireEvent.click(screen.getByTestId('close-account-recovery-dismissed'));

    key = localStorage.getItem(
      '__fxa_storage.fxa_disable_notification_banner.account-recovery-dismissed'
    );
    expect(key).toBe('true');
  });
});
