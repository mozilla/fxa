/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  SignupConfirmedSyncIntegration,
  SignupConfirmedSyncProps,
} from './interfaces';
import { MemoryRouter } from 'react-router';
import SignupConfirmedSync from '.';
import { RelierCmsInfo } from '../../../models/integrations';

export function createMockIntegration(
  isDesktopSync = true,
  cmsInfo?: RelierCmsInfo
): SignupConfirmedSyncIntegration {
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
    return (
      <MemoryRouter initialEntries={[{ pathname: '/signup_confirmed_sync', state: { origin } }]}>
        <SignupConfirmedSync {...{ integration, offeredSyncEngines }} />
      </MemoryRouter>
    );
  }

  return (
    <MemoryRouter>
      <SignupConfirmedSync {...{ integration, offeredSyncEngines }} />
    </MemoryRouter>
  );
};
