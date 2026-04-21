/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { PageSecondaryEmailAdd } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { MfaContext } from '../MfaGuard';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Pages/Settings/SecondaryEmailAdd',
  component: PageSecondaryEmailAdd,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppContext.Provider value={mockAppContext()}>
      <SettingsLayout>
        <MfaContext.Provider value="email">
          <PageSecondaryEmailAdd />
        </MfaContext.Provider>
      </SettingsLayout>
    </AppContext.Provider>
  </LocationProvider>
);
