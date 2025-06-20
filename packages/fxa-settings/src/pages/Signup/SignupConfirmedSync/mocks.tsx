/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  SignupConfirmedSyncIntegration,
  SignupConfirmedSyncProps,
} from './interfaces';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import SignupConfirmedSync from '.';
import { RelierCmsInfo } from '../../../models';

export function createMockIntegration({
  isDesktopSync = true,
  cmsInfo,
}: {
  isDesktopSync?: boolean;
  cmsInfo?: RelierCmsInfo;
} = {}): SignupConfirmedSyncIntegration {
  return {
    isDesktopSync: () => isDesktopSync,
    getCmsInfo: () => cmsInfo,
  };
}

export const Subject = ({
  integration = createMockIntegration(),
  offeredSyncEngines = [],
  origin,
}: {
  integration?: ReturnType<typeof createMockIntegration>;
  offeredSyncEngines?: SignupConfirmedSyncProps['offeredSyncEngines'];
  origin?: string;
}) => {
  // If an origin is provided, wire up a memory history so
  // we’re “coming from” post-verify-set-password
  if (origin) {
    const locationWithState = {
      pathname: '/signup_confirmed_sync',
      search: '',
      hash: '',
      state: { origin },
    };
    const history = createHistory(
      createMemorySource(locationWithState.pathname)
    );
    history.navigate('/signup_confirmed_sync', {
      state: { origin },
    });

    return (
      <LocationProvider {...{ history }}>
        <SignupConfirmedSync {...{ integration, offeredSyncEngines }} />
      </LocationProvider>
    );
  }

  return (
    <LocationProvider>
      <SignupConfirmedSync {...{ integration, offeredSyncEngines }} />
    </LocationProvider>
  );
};
