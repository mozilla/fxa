/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { Security } from '.';
import { MockedCache } from '../../models/_mocks';

storiesOf('Components|Security', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache account={{ recoveryKey: false, totp: { exists: false } }}>
      <Security />
    </MockedCache>
  ))
  .add('account recovery key set and two factor enabled', () => (
    <MockedCache account={{ recoveryKey: true, totp: { exists: true } }}>
      <Security />
    </MockedCache>
  ));
