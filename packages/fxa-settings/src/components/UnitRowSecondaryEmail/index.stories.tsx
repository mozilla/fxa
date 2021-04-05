/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { InMemoryCache } from '@apollo/client';
import { UnitRowSecondaryEmail } from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import { MockedCache, MOCK_ACCOUNT, mockEmail } from '../../models/_mocks';
import { GET_INITIAL_STATE } from '../App';
import { LocationProvider } from '@reach/router';

storiesOf('Components|UnitRowSecondaryEmail', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('No secondary email set', () => (
    <MockedCache>
      <AlertBarRootAndContextProvider>
        <UnitRowSecondaryEmail />
      </AlertBarRootAndContextProvider>
    </MockedCache>
  ))
  .add('One secondary email set, unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false, false),
    ];
    return (
      <MockedCache>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('One secondary email set, verified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
    ];
    return (
      <MockedCache account={{ emails }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('Multiple secondary emails set, all verified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false),
      mockEmail('johndope4@example.com', false),
    ];
    return (
      <MockedCache account={{ emails }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('Multiple secondary emails set, one unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false, false),
      mockEmail('johndope4@example.com', false),
    ];
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_INITIAL_STATE,
      data: {
        account: { ...MOCK_ACCOUNT, emails },
        session: { verified: true },
      },
    });
    return (
      <MockedCache>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('Multiple secondary emails set, multiple unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false, false),
      mockEmail('johndope4@example.com', false, false),
    ];
    return (
      <MockedCache>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  });
