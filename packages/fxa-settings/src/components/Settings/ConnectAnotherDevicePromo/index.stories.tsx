/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { ConnectAnotherDevicePromo } from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Components/Settings/ConnectAnotherDevice',
  component: ConnectAnotherDevicePromo,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <AppContext.Provider
          value={mockAppContext({ navigatorLanguages: navigator.languages })}
        >
          <Story />
        </AppContext.Provider>
      </LocationProvider>
    ),
  ],
} as Meta;

export const Default = () => <ConnectAnotherDevicePromo />;
