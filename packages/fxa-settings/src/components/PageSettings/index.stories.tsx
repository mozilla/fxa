/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageSettings } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { isMobileDevice } from '../../lib/utilities';
import { MockedCache, mockEmail } from '../../models/_mocks';
import { MOCK_SERVICES } from '../ConnectedServices/MOCK_SERVICES';

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter(d => !isMobileDevice(d));

storiesOf('Pages|Settings', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('cold start', () => (
    <MockedCache
      account={{
        displayName: null,
        avatarUrl: null,
        recoveryKey: false,
        totp: { exists: false, verified: false },
        attachedClients: SERVICES_NON_MOBILE
      }}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </MockedCache>
  ))
  .add('partially filled out', () => (
    <MockedCache
      account={{ displayName: null, totp: { exists: true, verified: false, },
      attachedClients: SERVICES_NON_MOBILE }}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </MockedCache>
  ))

  .add('completely filled out', () => (
    <MockedCache
      account={{
        subscriptions: [{ created: 1, productName: 'x' }],
        emails: [
          mockEmail('johndope@example.com'),
          mockEmail('johndope2@gmail.com', false),
        ],
        attachedClients: SERVICES_NON_MOBILE
      }}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </MockedCache>
  ));
