/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { PageSecondaryEmailVerify } from '.';
import { WindowLocation, LocationProvider } from '@reach/router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Pages/Settings/SecondaryEmailVerify',
  component: PageSecondaryEmailVerify,
  decorators: [withLocalization],
} as Meta;

const mockLocation = {
  state: { email: 'johndope@example.com' },
} as unknown as WindowLocation;

export const Default = () => (
  <LocationProvider>
    <SettingsLayout>
      <PageSecondaryEmailVerify location={mockLocation} />
    </SettingsLayout>
  </LocationProvider>
);
