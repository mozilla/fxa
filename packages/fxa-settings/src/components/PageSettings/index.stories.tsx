/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageSettings } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { isMobileDevice } from '../../lib/utilities';
import { mockAppContext, mockEmail, MOCK_ACCOUNT } from '../../models/mocks';
import { MOCK_SERVICES } from '../ConnectedServices/mocks';
import { AppContext } from 'fxa-settings/src/models';

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter((d) => !isMobileDevice(d));

storiesOf('Pages/Settings', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('cold start', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          ...MOCK_ACCOUNT,
          displayName: null,
          avatar: { id: null, url: null },
          recoveryKey: false,
          totp: { exists: false, verified: false },
          attachedClients: SERVICES_NON_MOBILE,
        } as any,
      })}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </AppContext.Provider>
  ))
  .add('partially filled out', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          ...MOCK_ACCOUNT,
          displayName: null,
          totp: { exists: true, verified: false },
          attachedClients: SERVICES_NON_MOBILE,
        } as any,
      })}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </AppContext.Provider>
  ))

  .add('completely filled out', () => (
    <AppContext.Provider
      value={mockAppContext({
        account: {
          ...MOCK_ACCOUNT,
          subscriptions: [{ created: 1, productName: 'x' }],
          emails: [
            mockEmail('johndope@example.com'),
            mockEmail('johndope2@gmail.com', false),
          ],
          attachedClients: SERVICES_NON_MOBILE,
        } as any,
      })}
    >
      <AppLayout>
        <PageSettings />
      </AppLayout>
    </AppContext.Provider>
  ));
