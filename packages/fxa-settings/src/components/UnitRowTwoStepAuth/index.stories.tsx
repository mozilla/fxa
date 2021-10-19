/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import UnitRowTwoStepAuth from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

storiesOf('Components/UnitRowTwoStepAuth', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default unset', () => (
    <AppContext.Provider
      value={mockAppContext({ account: { totp: { enabled: false } } as any })}
    >
      <UnitRowTwoStepAuth />
    </AppContext.Provider>
  ))
  .add('enabled', () => <UnitRowTwoStepAuth />);
