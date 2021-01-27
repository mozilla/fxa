/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';

import { MockedCache } from '../../models/_mocks';
import AppLayout from '../AppLayout';

import PageAddAvatar from './Add';
import PageChangeAvatar from './Change';
import { PageCaptureAvatar } from './Capture';

storiesOf('Pages|PageChangeAvatar', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache>
      <AppLayout>
        <PageChangeAvatar />
      </AppLayout>
    </MockedCache>
  ));

storiesOf('Pages|PageAddAvatar', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache>
      <AppLayout>
        <PageAddAvatar />
      </AppLayout>
    </MockedCache>
  ));

storiesOf('Pages|PageCaptureAvatar', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache>
      <AppLayout>
        <PageCaptureAvatar />
      </AppLayout>
    </MockedCache>
  ));
