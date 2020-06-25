/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Avatar } from '.';

storiesOf('Components|Avatar', module)
  .add('default avatar', () => (
    <Avatar avatarUrl={null} className="w-32 h-32" />
  ))
  .add('non-default avatar', () => (
    <Avatar className="w-32 h-32" avatarUrl="http://placekitten.com/256/256" />
  ));
