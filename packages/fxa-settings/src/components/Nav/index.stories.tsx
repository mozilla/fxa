/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { mockSession } from '../../models/_mocks';
import { getDefault } from '../../lib/config';
import { Nav } from '.';
import { AppContext } from 'fxa-settings/src/models';

const account = {
  primaryEmail: {
    email: 'johndope@example.com',
  },
  subscriptions: [{ created: 1, productName: 'x' }],
} as any;
storiesOf('Components/Nav', module)
  .add('basic', () => <Nav />)
  .add('with link to Subscriptions', () => (
    <AppContext.Provider value={{ account, session: mockSession() }}>
      <Nav />
    </AppContext.Provider>
  ))
  .add('without link to Newsletters', () => {
    const config = Object.assign({}, getDefault(), {
      marketingEmailPreferencesUrl: '',
    });

    return (
      <AppContext.Provider value={{ account, session: mockSession(), config }}>
        <Nav />
      </AppContext.Provider>
    );
  });
