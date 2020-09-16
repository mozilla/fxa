/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MockedCache, mockAccountQuery } from '../../models/_mocks';
import UnitRowTwoStepAuth from '.';

storiesOf('Components|UnitRowTwoStepAuth', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default unset', () => (
    <MockedCache
      account={{ totp: { exists: false, verified: false } }}
      mocks={[mockAccountQuery({ exists: true, verified: false })]}
    >
      <UnitRowTwoStepAuth />
    </MockedCache>
  ))
  .add('enabled, not verified', () => (
    <MockedCache
      account={{ totp: { exists: true, verified: false } }}
      mocks={[mockAccountQuery({ exists: true, verified: false })]}
    >
      <UnitRowTwoStepAuth />
    </MockedCache>
  ))
  .add('enabled and unverified session', () => (
    <MockedCache
      verified={false}
      account={{ totp: { exists: true, verified: false } }}
      mocks={[mockAccountQuery({ exists: true, verified: false })]}
    >
      <UnitRowTwoStepAuth />
    </MockedCache>
  ));
