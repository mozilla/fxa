/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Security } from '.';
import { MockedCache } from '../../models/_mocks';

storiesOf('Components|Security', module)
  .add('default', () => (
    <MockedCache account={{ recoveryKey: false }}>
      <Security twoFactorAuthEnabled={false} />
    </MockedCache>
  ))
  .add('account recovery key set and two factor enabled', () => (
    <MockedCache>
      <Security twoFactorAuthEnabled={true} />
    </MockedCache>
  ));
