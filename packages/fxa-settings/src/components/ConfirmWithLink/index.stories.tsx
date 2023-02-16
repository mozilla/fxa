/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmWithLink from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { DefaultSubject, SubjectCanGoBack, SubjectWithWebmail } from './mocks';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/ConfirmWithLink',
  component: ConfirmWithLink,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <DefaultSubject />
    </AppLayout>
  </LocationProvider>
);

export const UserCanGoBack = () => (
  <LocationProvider>
    <AppLayout>
      <SubjectCanGoBack />
    </AppLayout>
  </LocationProvider>
);

export const withWebmailLink = () => (
  <LocationProvider>
    <AppLayout>
      <SubjectWithWebmail />
    </AppLayout>
  </LocationProvider>
);
