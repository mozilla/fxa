/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageChangePassword } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { MockedCache } from 'fxa-settings/src/models/_mocks';

storiesOf('Pages|ChangePassword', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache>
      <AppLayout>
        <PageChangePassword />
      </AppLayout>
    </MockedCache>
  ));
