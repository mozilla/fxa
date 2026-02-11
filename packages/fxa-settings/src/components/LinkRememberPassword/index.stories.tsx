/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkRememberPassword from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/LinkRememberPassword',
  component: LinkRememberPassword,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <LinkRememberPassword email={MOCK_ACCOUNT.primaryEmail.email} />
  </LocationProvider>
);
