/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SetPassword from '.';
import { LocationProvider } from '@reach/router';
import { CreatePasswordHandler } from './interfaces';
import { MOCK_EMAIL } from '../../mocks';
import { useMockSyncEngines } from '../../../lib/hooks/useSyncEngines/mocks';

export const Subject = ({
  email = MOCK_EMAIL,
  createPasswordHandler = () => Promise.resolve({ error: null }),
}: {
  email?: string;
  createPasswordHandler?: CreatePasswordHandler;
}) => {
  const { offeredSyncEngineConfigs, setDeclinedSyncEngines } =
    useMockSyncEngines();
  return (
    <LocationProvider>
      <SetPassword
        {...{
          email,
          createPasswordHandler,
          offeredSyncEngineConfigs,
          setDeclinedSyncEngines,
        }}
      />
    </LocationProvider>
  );
};
