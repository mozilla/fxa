/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { storiesOf } from '@storybook/react';
import { MockedCache } from '../../models/_mocks';
import React from 'react';
import { PageTwoStepAuthentication } from '.';
import AppLayout from '../AppLayout';
import { CREATE_TOTP_MOCK } from './_mocks';

storiesOf('Pages|TwoStepAuthentication', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <MockedCache mocks={CREATE_TOTP_MOCK}>
      <AppLayout>
        <PageTwoStepAuthentication />
      </AppLayout>
    </MockedCache>
  ));
