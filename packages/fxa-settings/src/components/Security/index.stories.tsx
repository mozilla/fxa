/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { Security } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

storiesOf('Components/Security', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          recoveryKey: false,
          passwordCreated: Date.now(),
          totp: { exists: false },
        } as any,
      })}
    >
      <Security />
    </AppContext.Provider>
  ))
  .add('account recovery key set and two factor enabled', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          recoveryKey: true,
          passwordCreated: Date.now(),
          totp: { verified: true, exists: true },
        } as any,
      })}
    >
      <Security />
    </AppContext.Provider>
  ));
