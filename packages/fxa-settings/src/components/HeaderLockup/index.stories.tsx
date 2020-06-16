/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { HeaderLockup } from '.';

storiesOf('Components|HeaderLockup', module)
  .add('with default avatar', () => (
    <HeaderLockup avatarUrl={null} primaryEmail="user@example.com" />
  ))
  .add('with non-default avatar', () => (
    <HeaderLockup
      avatarUrl="http://placekitten.com/256/256"
      primaryEmail="user@example.com"
    />
  ));
