/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SetPassword from '.';
import { LocationProvider } from '@reach/router';
import {
  CreatePasswordHandler,
  PostVerifySetPasswordIntegration,
} from './interfaces';
import { MOCK_EMAIL } from '../../mocks';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { RelierCmsInfo } from '../../../models';

export function createMockIntegration(
  cmsInfo?: RelierCmsInfo
): PostVerifySetPasswordIntegration {
  return {
    getCmsInfo: () => cmsInfo,
  };
}

export const Subject = ({
  email = MOCK_EMAIL,
  createPasswordHandler = () => Promise.resolve({ error: null }),
  integration,
  isPasswordlessFlow = false,
}: {
  email?: string;
  createPasswordHandler?: CreatePasswordHandler;
  integration?: PostVerifySetPasswordIntegration;
  isPasswordlessFlow?: boolean;
}) => {
  const { offeredSyncEngineConfigs } = mockUseFxAStatus();
  return (
    <LocationProvider>
      <SetPassword
        {...{
          email,
          createPasswordHandler,
          offeredSyncEngineConfigs,
          integration,
          isPasswordlessFlow,
        }}
      />
    </LocationProvider>
  );
};
