/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Supp from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ERROR } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/Supp',
  component: Supp,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const DefaultLoadingState = () => <Supp />;

export const WithError = () => <Supp error={MOCK_ERROR} />;
