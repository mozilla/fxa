/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmSignupCode from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { LocationProvider } from '@reach/router';

export default {
  title: 'Pages/Signup/ConfirmSignupCode',
  component: ConfirmSignupCode,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <ConfirmSignupCode />
  </LocationProvider>
);
