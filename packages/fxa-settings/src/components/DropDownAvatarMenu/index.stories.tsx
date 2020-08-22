/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockedCache } from '../../models/_mocks';
import DropDownAvatarMenu from '.';

storiesOf('Components|DropDownAvatarMenu', module)
  .add('default - no avatar or display name', () => (
    <MockedCache account={{ avatarUrl: null, displayName: null }}>
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <DropDownAvatarMenu />
        </div>
      </div>
    </MockedCache>
  ))
  .add('with avatar and display name', () => (
    <MockedCache>
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <DropDownAvatarMenu />
        </div>
      </div>
    </MockedCache>
  ));
