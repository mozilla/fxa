/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { ConnectedServices } from '.';

import { MOCK_SERVICES } from './MOCK_SERVICES';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

storiesOf('Components/ConnectedServices', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: { attachedClients: MOCK_SERVICES } as any,
      })}
    >
      <ConnectedServices />
    </AppContext.Provider>
  ));
