/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { ConnectAnotherDevicePromo } from '.';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AppContext } from '../../../models';
import { mockAppContext, mockSettingsContext } from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

export default {
  title: 'Components/Settings/ConnectAnotherDevice',
  component: ConnectAnotherDevicePromo,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <LocationProvider>
        <AppContext.Provider value={mockAppContext()}>
          <SettingsContext.Provider
            value={mockSettingsContext({
              navigatorLanguages: navigator.languages,
            })}
          >
            <Story />
          </SettingsContext.Provider>
        </AppContext.Provider>
      </LocationProvider>
    ),
  ],
} as Meta;

export const Default = () => <ConnectAnotherDevicePromo />;
