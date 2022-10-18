/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { HeaderLockup } from '.';
import { AppContext } from '../../models';
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

storiesOf('Components/HeaderLockup', module)
  .add('with default avatar', () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <HeaderLockup />
    </AppContext.Provider>
  ))
  .add('with non-default avatar', () => <HeaderLockup />);
