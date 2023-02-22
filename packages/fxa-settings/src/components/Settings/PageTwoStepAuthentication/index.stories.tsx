/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import React from 'react';
import { PageTwoStepAuthentication } from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Settings/TwoStepAuthentication',
  component: PageTwoStepAuthentication,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <PageTwoStepAuthentication />
    </AppLayout>
  </LocationProvider>
);
