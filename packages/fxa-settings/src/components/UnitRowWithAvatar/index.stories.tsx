/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MockedCache } from '../../models/_mocks';
import { UnitRowWithAvatar } from '.';

storiesOf('Components|UnitRowWithAvatar', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('with default avatar', () => (
    <MockedCache account={{ avatarUrl: null }}>
      <UnitRowWithAvatar />
    </MockedCache>
  ))
  .add('with non-default avatar', () => (
    <MockedCache>
      <UnitRowWithAvatar />
    </MockedCache>
  ))
