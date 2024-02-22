/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Integration, IntegrationType } from '../../../models';
import { SigninTokenCodeProps } from './interfaces';
import SigninTokenCode from '.';
import {
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationReasons from '../../../constants/verification-reasons';

export function createMockWebIntegration() {
  return {
    type: IntegrationType.Web,
    getService: () => MozServices.Default,
    isSync: () => false,
    wantsKeys: () => false,
  } as Integration;
}

export const createMockSigninLocationState = (
  verificationReason?: VerificationReasons
) => {
  return {
    email: MOCK_EMAIL,
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    verified: false,
    ...(verificationReason && { verificationReason }),
  };
};

export const Subject = ({
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  integration = createMockWebIntegration(),
  verificationReason = undefined,
}: Partial<SigninTokenCodeProps> & {
  verificationReason?: VerificationReasons;
}) => {
  return (
    <LocationProvider>
      <SigninTokenCode
        {...{
          finishOAuthFlowHandler,
          integration,
        }}
        signinLocationState={createMockSigninLocationState(verificationReason)}
      />
    </LocationProvider>
  );
};
