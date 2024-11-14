/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { LocationProvider } from '@reach/router';
import FormPassword from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MockSettingsAppLayout } from '../Settings/SettingsLayout/mocks';

export default {
  title: 'Components/FormPassword',
  component: FormPassword,
  decorators: [withLocalization],
} as Meta;
export const WithCurrentPassword = () => (
  <LocationProvider>
    <MockSettingsAppLayout>
      <div className="max-w-lg mx-auto">
        <Subject />
      </div>
    </MockSettingsAppLayout>
  </LocationProvider>
);

export const WithoutCurrentPassword = () => (
  <LocationProvider>
    <MockSettingsAppLayout>
      <div className="max-w-lg mx-auto">
        <Subject includeCurrentPw={false} />
      </div>
    </MockSettingsAppLayout>
  </LocationProvider>
);
