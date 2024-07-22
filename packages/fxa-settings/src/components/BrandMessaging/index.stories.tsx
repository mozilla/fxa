/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { BrandMessaging } from '.';

export default {
  title: 'Components/BrandMessaging',
  component: BrandMessaging,
  decorators: [withLocalization],
} as Meta;

export const PreLaunch = () => (
  <BrandMessaging mode="prelaunch" viewName="storybook" />
);

export const PostLaunch = () => (
  <BrandMessaging mode="postlaunch" viewName="storybook" />
);
