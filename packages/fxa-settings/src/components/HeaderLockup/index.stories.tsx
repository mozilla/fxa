/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockedCache } from '../../models/_mocks';
import { HeaderLockup } from '.';

storiesOf('Components|HeaderLockup', module)
  .add('with default avatar', () => (
    <MockedCache account={{ avatarUrl: null }}>
      <HeaderLockup />
    </MockedCache>
  ))
  .add('with non-default avatar', () => (
    <MockedCache>
      <HeaderLockup />
    </MockedCache>
  ));
