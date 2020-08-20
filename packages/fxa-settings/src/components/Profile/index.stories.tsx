/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Profile } from '.';
import { MockedCache } from '../../models/_mocks';

storiesOf('Components|Profile', module).add('default', () => (
  <MockedCache>
    <Profile />
  </MockedCache>
));
