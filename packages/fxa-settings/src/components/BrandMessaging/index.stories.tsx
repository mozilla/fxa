/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import { withLocalization } from 'fxa-react/lib/storybooks';
import BrandMessaging from '.';

export default {
  title: 'Components/BrandMessaging',
  component: BrandMessaging,
  decorators: [withLocalization],
} as Meta;

export const NoLaunch = () => (
  <AppLayout>
    <BrandMessaging viewName="storybook" />
  </AppLayout>
);

export const PreLaunch = () => (
  <AppLayout>
    <BrandMessaging mode="prelaunch" viewName="storybook" />
  </AppLayout>
);

export const PostLaunch = () => (
  <AppLayout>
    <BrandMessaging mode="postlaunch" viewName="storybook" />
  </AppLayout>
);
