/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import SigninRecoveryChoice from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_SIGNIN_LOCATION_STATE } from './mocks';
import { MemoryRouter } from 'react-router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  createMockSigninOAuthIntegration,
  MOCK_CMS_INFO,
  MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
} from '../mocks';

export default {
  title: 'Pages/Signin/SigninRecoveryChoice',
  component: SigninRecoveryChoice,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve()}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </MemoryRouter>
);

export const DefaultWithCms = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve()}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
      integration={createMockSigninOAuthIntegration({ cmsInfo: MOCK_CMS_INFO })}
    />
  </MemoryRouter>
);

export const SplitLayoutWithCms = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve()}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
      integration={createMockSigninOAuthIntegration({
        cmsInfo: {
          ...MOCK_CMS_INFO,
          SigninRecoveryChoicePage: {
            ...MOCK_CMS_INFO.SigninRecoveryChoicePage!,
            splitLayout: true,
          },
        },
      })}
    />
  </MemoryRouter>
);

export const WithSMSSendRateLimitExceeded = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED)
      }
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </MemoryRouter>
);

export const WithUnexpectedError = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.UNEXPECTED_ERROR)}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </MemoryRouter>
);

export const WithBackendServiceFailure = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.BACKEND_SERVICE_FAILURE)
      }
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </MemoryRouter>
);

export const WithThrottlingError = () => (
  <MemoryRouter>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.THROTTLED)}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </MemoryRouter>
);
