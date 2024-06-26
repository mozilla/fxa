/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageChangePassword } from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MockSettingsAppLayout } from '../AppLayout/mocks';

export default {
  title: 'Pages/Settings/ChangePassword',
  component: PageChangePassword,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <MockSettingsAppLayout>
      <PageChangePassword />
    </MockSettingsAppLayout>
  </LocationProvider>
);
