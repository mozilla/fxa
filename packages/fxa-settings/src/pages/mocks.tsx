/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as LoadingSpinnerModule from 'fxa-react/components/LoadingSpinner';

import { MozServices } from '../lib/types';
import { MOCK_ACCOUNT } from '../models/mocks';

export const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;
export const MOCK_UID = 'abcd1234abcd1234abcd1234abcd1234';
export const MOCK_REDIRECT_URI = 'http://localhost:8080/123Done';
export const MOCK_CLIENT_ID = '123';
export const MOCK_SERVICE = MozServices.TestService;
export const MOCK_SESSION_TOKEN = 'sessionToken';
export const MOCK_UNWRAP_BKEY = '10000000000000000123456789abcdef';
export const MOCK_KA = '10000000000000000123456789abcdef';
export const MOCK_KB = '10000000000000000123456789abcdef';
export const MOCK_KEY_FETCH_TOKEN = 'keyFetchToken';
export const MOCK_KEY_FETCH_TOKEN_2 = 'keyFetchToken2';
export const MOCK_RESET_TOKEN = 'mockResetToken';
export const MOCK_AUTH_AT = 12345;
export const MOCK_PASSWORD = 'notYourAveragePassW0Rd';
export const MOCK_AUTHPW =
  'b5a61d1f7a6b1b762539bd85f783b65f635def1025c3f66fc51a438a68a77d6d';
export const MOCK_UNBLOCK_CODE = 'A1B2C3D4';
export const MOCK_BACKUP_CODE = 'a1b2c3d4e5';
export const PLACEHOLDER_IMAGE_URL = 'https://loremflickr.com/512/512';
export const MOCK_AVATAR_NON_DEFAULT = {
  id: 'abc123',
  url: PLACEHOLDER_IMAGE_URL,
};
export const MOCK_AVATAR_DEFAULT = { id: null, url: null };
export const MOCK_STORED_ACCOUNT = {
  uid: MOCK_UID,
  lastLogin: Date.now(),
  email: MOCK_EMAIL,
  sessionToken: MOCK_SESSION_TOKEN,
  metricsEnabled: true,
  verified: false,
};
export const MOCK_AUTH_PW = 'apw123';
export const MOCK_OAUTH_FLOW_HANDLER_RESPONSE = {
  redirect: 'someUri',
  code: 'someCode',
  state: 'someState',
  error: undefined,
};
export const mockFinishOAuthFlowHandler = () =>
  Promise.resolve(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
export const MOCK_WRAP_KB = '0123456789abcdef0123456789abcdef';
export const MOCK_HEXSTRING_32 = '0123456789abcdef0123456789abcdef';

export const MOCK_CLIENT_SALT =
  'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef';

export const MOCK_UNWRAP_BKEY_V2 = '20000000000000000123456789abcdef';
export const MOCK_WRAP_KB_V2 = '20000000000000000123456789abcdef';
export const MOCK_AUTH_PW_V2 = 'apw234';
export const MOCK_PASSWORD_CHANGE_TOKEN = '123456789abcdef0';
export const MOCK_FLOW_ID = '00ff';

export function mockLoadingSpinnerModule() {
  jest.spyOn(LoadingSpinnerModule, 'LoadingSpinner').mockImplementation(() => {
    return <div>loading spinner mock</div>;
  });
}
export const MOCK_RECOVERY_KEY = 'ANMD1S097Y2Y4EES02CWBJ6ZPYKPH69F';
export const MOCK_RECOVERY_KEY_WITH_SPACES =
  'ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F';
export const MOCK_RECOVERY_KEY_INVALID = 'ANMD1S097Y2Y4EES02CWBJ6ZPYKPH69L';
export const MOCK_REMOTE_METADATA = JSON.stringify({});
export const ALL_PRODUCT_PROMO_SERVICES = [{ name: MozServices.Monitor }];
export const ALL_PRODUCT_PROMO_SUBSCRIPTIONS = [
  { productName: MozServices.MonitorPlus },
];
export const MOCK_FULL_PHONE_NUMBER = '+15555551234';
export const MOCK_NATIONAL_FORMAT_PHONE_NUMBER = '(555) 555-1234';
export const MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER = '(•••) •••-1234';
export const MOCK_MASKED_NUMBER_ENDING_IN_1234 = '1234';
export const MOCK_MASKED_PHONE_NUMBER_WITH_COPY = 'Number ending in 1234';
export const MOCK_2FA_SECRET_KEY_RAW = 'JBSWY3DPEHPK3PXP';
export const MOCK_BACKUP_CODES = [
  'a9k3m2z8q1',
  'b7x2v5n4l6',
  'p0s8d3f1g7',
  'w4e6r2t9y5',
  'u3i7o1l8k2',
  'z6x9c5v3b8',
  'n2m4j7h1g9',
  'q5w8e2r6t3',
];
export const PLACEHOLDER_QR_CODE =
  'https://placehold.co/192x192/white/black?text=QR+Code&font=poppins';

export const MOCK_CMS_INFO = {
  clientId: 'dcdb5ae7add825d2',
  entrypoint: 'app',
  name: '123Done - app',
  shared: {
    buttonColor: '#D41C1C',
    logoUrl:
      'https://gist.githubusercontent.com/vbudhram/c53b07efd1656acfff7d2c7e9d6825fe/raw/030df98ee27f609333606d36c7bf3af45af53f39/123Done_red.svg',
    logoAltText: 'logo',
  },
  EmailFirstPage: {
    headline: 'Sign up or sign in to your Mozilla account',
    description:
      'Stay protected with continuous data monitoring and automatic data removal.',
    primaryButtonText: 'Continue',
  },
  SignupSetPasswordPage: {
    headline: 'Create a password',
    description: 'to continue',
    primaryButtonText: 'Continue',
  },
  SignupConfirmCodePage: {
    headline: 'Enter confirmation code',
    description: 'For your Mozilla account',
    primaryButtonText: 'Confirm',
  },
  SignupConfirmedSyncPage: {
    headline: 'Sync is turned on',
    description:
      'Your passwords, addresses, bookmarks, history, and more can sync everywhere you use Firefox.',
    primaryButtonText: 'Add another device',
  },

  SigninPage: {
    headline: 'Enter your password',
    description: 'for your Mozilla account',
    primaryButtonText: 'Sign in',
  },
  SigninTokenCodePage: {
    headline: 'Enter confirmation code',
    description: 'for your Mozilla account',
    primaryButtonText: 'Continue',
  },
  SigninUnblockCodePage: {
    headline: 'Authorize this sign-in',
    description: 'for your Mozilla account',
    primaryButtonText: 'Continue',
  },
};
