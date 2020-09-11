/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MockedCache, mockAccountQuery } from '../../models/_mocks';
import UnitRowRecoveryKey from '.';

storiesOf('Components|UnitRowRecoveryKey', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('with recovery key', () => (
    <MockedCache
      account={{ recoveryKey: true }}
      mocks={[mockAccountQuery({ recoveryKey: false })]}
    >
      <UnitRowRecoveryKey />
    </MockedCache>
  ))
  .add('no recovery key', () => (
    <MockedCache
      account={{ recoveryKey: false }}
      mocks={[mockAccountQuery({ recoveryKey: true })]}
    >
      <UnitRowRecoveryKey />
    </MockedCache>
  ))
  .add('with recovery key and unverified session', () => (
    <MockedCache
      account={{ recoveryKey: true }}
      verified={false}
      mocks={[mockAccountQuery({ recoveryKey: false })]}
    >
      <UnitRowRecoveryKey />
    </MockedCache>
  ));
