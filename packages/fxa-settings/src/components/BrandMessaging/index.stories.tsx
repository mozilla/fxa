/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { BrandMessagingPortal } from '.';
import AppLayout from '../Settings/AppLayout';

export default {
  title: 'Components/BrandMessaging',
  component: BrandMessagingPortal,
  decorators: [withLocalization],
} as Meta;

export const NoLaunch = () => (
  <AppLayout>
    <BrandMessagingPortal viewName="storybook" />
  </AppLayout>
);

export const PreLaunch = () => (
  <AppLayout>
    <BrandMessagingPortal mode="prelaunch" viewName="storybook" />
  </AppLayout>
);

export const PostLaunch = () => (
  <AppLayout>
    <BrandMessagingPortal mode="postlaunch" viewName="storybook" />
  </AppLayout>
);
