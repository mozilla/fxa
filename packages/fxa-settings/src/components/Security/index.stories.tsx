/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Security } from '.';

storiesOf('Components|Security', module)
  .add('default', () => (
    <Security accountRecoveryKeyEnabled={false} twoFactorAuthEnabled={false} />
  ))
  .add('account recovery key set and two factor enabled', () => (
    <Security accountRecoveryKeyEnabled={true} twoFactorAuthEnabled={true} />
  ));
