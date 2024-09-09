/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import NotificationPromoBanner from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import keyImage from './key.svg';

export default {
  title: 'Components/NotificationPromoBanner',
  component: NotificationPromoBanner,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

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

const disabledNotificationProps = {
  ...notificationProps,
  isVisible: false,
};

export const Default = () => (
  <NotificationPromoBanner {...notificationProps}></NotificationPromoBanner>
);

export const NotVisible = () => (
  <NotificationPromoBanner
    {...disabledNotificationProps}
  ></NotificationPromoBanner>
);

export const Stacked = () => (
  <>
    <NotificationPromoBanner {...notificationProps}></NotificationPromoBanner>
    <NotificationPromoBanner {...notificationProps}></NotificationPromoBanner>
  </>
);
