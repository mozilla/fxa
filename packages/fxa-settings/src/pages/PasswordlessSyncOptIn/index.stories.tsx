/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PasswordlessSyncOptIn from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/PasswordlessSyncOptIn',
  component: PasswordlessSyncOptIn,
  decorators: [withLocalization],
} as Meta;

const handlers = {
  onEnable: action('onEnable'),
  onNotNow: action('onNotNow'),
};

export const Default = () => <Subject {...handlers} />;

export const Enabling = () => <Subject isEnabling {...handlers} />;

export const WithError = () => (
  <Subject
    localizedErrorBannerMessage="Something went wrong. Please try again."
    {...handlers}
  />
);
