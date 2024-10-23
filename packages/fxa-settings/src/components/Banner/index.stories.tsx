/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Banner, { BannerType, FancyBanner } from '.';
import { Meta } from '@storybook/react';
import AppLayout from '../AppLayout';
import { Subject } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Banner',
  component: Banner,
  decorators: [withLocalization],
} as Meta;

export const Info = () => (
  <AppLayout>
    <Banner type={BannerType.info}>
      <p>This is an "info" type banner inside our AppLayout.</p>
    </Banner>
  </AppLayout>
);

export const Success = () => (
  <AppLayout>
    <Banner type={BannerType.success}>
      <p>This is a "success" type banner inside our AppLayout.</p>
    </Banner>
  </AppLayout>
);

export const Error = () => (
  <AppLayout>
    <Banner type={BannerType.error}>
      <p>This is an "error" type banner inside our AppLayout.</p>
    </Banner>
  </AppLayout>
);

export const DismissibleInfo = () => (
  <AppLayout>
    <Subject />
  </AppLayout>
);
export const FancySuccess = () => (
  <AppLayout>
    <FancyBanner
      type={BannerType.success}
      message={{ heading: 'Fancy heading', message: 'Fancy message' }}
      children={''}
    />
  </AppLayout>
);
