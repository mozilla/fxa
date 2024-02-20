/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { IntegrationType } from '../../../models';
import { SigninTokenCodeIntegration } from './interfaces';
import SigninTokenCode from '.';
import { MOCK_EMAIL } from '../../mocks';
import VerificationReasons from '../../../constants/verification-reasons';

export function createMockWebIntegration(): SigninTokenCodeIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
  };
}

export const Subject = ({
  integration = createMockWebIntegration(),
  verificationReason,
}: {
  integration?: SigninTokenCodeIntegration;
  verificationReason?: VerificationReasons;
}) => {
  return (
    <LocationProvider>
      <SigninTokenCode
        {...{
          email: MOCK_EMAIL,
          integration,
          verificationReason,
        }}
      />
    </LocationProvider>
  );
};
