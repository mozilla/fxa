/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import DropDownAvatarMenu from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

const account = {
  avatar: {
    url: null,
    id: null,
  },
  primaryEmail: {
    email: 'johndope@example.com',
  },
} as any;

storiesOf('Components/DropDownAvatarMenu', module)
  .add('default - no avatar or display name', () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <div className="w-full flex justify-end">
        <div className="flex pr-10 pt-4">
          <DropDownAvatarMenu />
        </div>
      </div>
    </AppContext.Provider>
  ))
  .add('with avatar and display name', () => (
    <div className="w-full flex justify-end">
      <div className="flex pr-10 pt-4">
        <DropDownAvatarMenu />
      </div>
    </div>
  ));
