/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../lib/types';
import { MOCK_ACCOUNT } from '../models/mocks';

export const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;
export const MOCK_UID = 'abc123';
export const MOCK_REDIRECT_URI = 'http://localhost:8080/123Done';
export const MOCK_CLIENT_ID = '123';
export const MOCK_SERVICE = MozServices.TestService;
export const MOCK_SESSION_TOKEN = 'sessionToken';
export const MOCK_UNWRAP_BKEY = 'unwrapBKey';
export const MOCK_KEY_FETCH_TOKEN = 'keyFetchToken';
export const MOCK_RESET_TOKEN = 'mockResetToken';
export const MOCK_AUTH_AT = 12345;
export const MOCK_PASSWORD = 'notYourAveragePassW0Rd';
export const MOCK_UNBLOCK_CODE = 'A1B2C3D4';
export const MOCK_AVATAR_NON_DEFAULT = {
  id: 'abc123',
  url: 'http://placekitten.com/512/512',
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
export const MOCK_HEXSTRING_32 = '152e8ef9975a0f3356e062dfe09d3f23';
export const MOCK_OAUTH_FLOW_HANDLER_RESPONSE = {
  redirect: 'someUri',
  code: 'someCode',
  state: 'someState',
};
export const mockFinishOAuthFlowHandler = () =>
  Promise.resolve(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
