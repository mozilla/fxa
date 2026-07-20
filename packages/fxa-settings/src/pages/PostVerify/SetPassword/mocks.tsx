/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SetPassword from '.';
import { MemoryRouter } from 'react-router';
import {
  CreatePasswordHandler,
  PasswordCreationReason,
  PostVerifySetPasswordIntegration,
} from './interfaces';
import { MOCK_EMAIL } from '../../mocks';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { RelierCmsInfo } from '../../../models';

export function createMockIntegration(
  cmsInfo?: RelierCmsInfo,
  { isSync = true } = {}
): PostVerifySetPasswordIntegration {
  return {
    getCmsInfo: () => cmsInfo,
    isSync: () => isSync,
  };
}

export const Subject = ({
  email = MOCK_EMAIL,
  createPasswordHandler = () => Promise.resolve({ error: null }),
  integration = createMockIntegration(),
  passwordCreationReason,
  gleanReason,
}: {
  email?: string;
  createPasswordHandler?: CreatePasswordHandler;
  integration?: PostVerifySetPasswordIntegration;
  passwordCreationReason?: PasswordCreationReason;
  gleanReason?: string;
}) => {
  const { offeredSyncEngineConfigs } = mockUseFxAStatus();
  return (
    <MemoryRouter>
      <SetPassword
        {...{
          email,
          createPasswordHandler,
          offeredSyncEngineConfigs,
          integration,
          passwordCreationReason,
          gleanReason,
        }}
      />
    </MemoryRouter>
  );
};
