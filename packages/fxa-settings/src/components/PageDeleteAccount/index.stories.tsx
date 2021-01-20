/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageDeleteAccount } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache } from '../../models/_mocks';

const client = createAuthClient('none');

storiesOf('Pages|DeleteAccount', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <AppLayout>
          <PageDeleteAccount />
        </AppLayout>
      </MockedCache>
    </AuthContext.Provider>
  ));
