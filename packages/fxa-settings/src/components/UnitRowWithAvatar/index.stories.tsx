/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { UnitRowWithAvatar } from '.';

storiesOf('Components|UnitRowWithAvatar', module)
  .add('with default avatar', () => <UnitRowWithAvatar avatarUrl={null} />)
  .add('with non-default avatar', () => (
    <UnitRowWithAvatar avatarUrl="http://placekitten.com/256/256" />
  ));
