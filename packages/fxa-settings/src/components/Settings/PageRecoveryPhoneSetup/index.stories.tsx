/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PageRecoveryPhoneSetup from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import SettingsLayout from '../SettingsLayout';
import { LocationProvider } from '@reach/router';

export default {
  title: 'Pages/Settings/RecoveryPhoneSetup',
  component: PageRecoveryPhoneSetup,
  decorators: [withLocalization],
} as Meta;

export const Step1 = () => (
  <LocationProvider>
    <SettingsLayout>
      <PageRecoveryPhoneSetup />
    </SettingsLayout>
  </LocationProvider>
);

// export const Step2 = () => (
//   <LocationProvider>
//     <SettingsLayout>
//       <PageRecoveryPhoneSetup testStep={2} testPhoneNumber="+1 123-456-7890" />
//     </SettingsLayout>
//   </LocationProvider>
// );
