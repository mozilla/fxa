/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { Security } from '.';
import { AppContext } from 'fxa-settings/src/models';

storiesOf('Components|Security', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <AppContext.Provider
      value={{
        account: { recoveryKey: false, totp: { exists: false } } as any,
      }}
    >
      <Security />
    </AppContext.Provider>
  ))
  .add('account recovery key set and two factor enabled', () => (
    <AppContext.Provider
      value={{
        account: {
          recoveryKey: true,
          totp: { verified: true, exists: true },
        } as any,
      }}
    >
      <Security />
    </AppContext.Provider>
  ));
