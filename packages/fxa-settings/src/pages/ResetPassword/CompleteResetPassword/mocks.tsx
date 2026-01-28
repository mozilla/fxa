/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { MOCK_EMAIL, MOCK_HEXSTRING_32, MOCK_UID } from '../../mocks';
import CompleteResetPassword from '.';
import { LocationProvider } from '@reach/router';
import {
  CompleteResetPasswordLocationState,
  CompleteResetPasswordProps,
} from './interfaces';
import { RelierCmsInfo, WebIntegration } from '../../../models';
import { GenericData } from '../../../lib/model-data';

const mockSubmitNewPassword = (newPassword: string) => Promise.resolve();

export function createMockWebIntegration({
  cmsInfo,
}: {
  cmsInfo?: RelierCmsInfo;
}) {
  const integration = new WebIntegration(
    new GenericData({
      uid: MOCK_UID,
    })
  );
  integration.cmsInfo = cmsInfo;
  return integration;
}

export const Subject = ({
  submitNewPassword = mockSubmitNewPassword,
  hasConfirmedRecoveryKey = false,
  recoveryKeyExists,
  testErrorMessage = '',
  estimatedSyncDeviceCount,
  integration = createMockWebIntegration({}),
}: Partial<CompleteResetPasswordProps> & {
  testErrorMessage?: string;
}) => {
  const email = MOCK_EMAIL;
  const [errorMessage, setErrorMessage] = useState(testErrorMessage);
  const locationState = {
    code: MOCK_HEXSTRING_32,
    email,
    token: MOCK_HEXSTRING_32,
    uid: MOCK_UID,
    recoveryKeyExists,
  } as CompleteResetPasswordLocationState;

  return (
    <LocationProvider>
      <CompleteResetPassword
        {...{
          email,
          errorMessage,
          locationState,
          setErrorMessage,
          submitNewPassword,
          hasConfirmedRecoveryKey,
          recoveryKeyExists,
          estimatedSyncDeviceCount,
          integration,
        }}
      />
    </LocationProvider>
  );
};
