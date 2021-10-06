/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import Avatar from '.';
import { AppContext } from 'fxa-settings/src/models';

const account = {
  avatar: {
    url: null,
    id: null,
  },
} as any;
storiesOf('Components/Avatar', module)
  .add('default avatar', () => (
    <AppContext.Provider value={{ account }}>
      <Avatar className="w-32 h-32" />
    </AppContext.Provider>
  ))
  .add('non-default avatar', () => <Avatar className="w-32 h-32" />);
