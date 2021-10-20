/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import UnitRowRecoveryKey from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

storiesOf('Components/UnitRowRecoveryKey', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('with recovery key', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          recoveryKey: true,
        } as any,
      })}
    >
      <UnitRowRecoveryKey />
    </AppContext.Provider>
  ))
  .add('no recovery key', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          recoveryKey: false,
        } as any,
      })}
    >
      <UnitRowRecoveryKey />
    </AppContext.Provider>
  ));
