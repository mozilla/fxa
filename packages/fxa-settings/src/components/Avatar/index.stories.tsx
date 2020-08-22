/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockedCache } from '../../models/_mocks';
import Avatar from '.';

storiesOf('Components|Avatar', module)
  .add('default avatar', () => (
    <MockedCache account={{ avatarUrl: null }}>
      <Avatar className="w-32 h-32" />
    </MockedCache>
  ))
  .add('non-default avatar', () => (
    <MockedCache>
      <Avatar className="w-32 h-32" />
    </MockedCache>
  ));
