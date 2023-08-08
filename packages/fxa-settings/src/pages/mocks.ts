/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../lib/types';
import { MOCK_ACCOUNT } from '../models/mocks';

export const MOCK_EMAIL = MOCK_ACCOUNT.primaryEmail.email;
export const MOCK_UID = 'abc123';
export const MOCK_REDIRECT_URI = 'http://localhost:8080/123Done';
export const MOCK_SERVICE = MozServices.FirefoxMonitor;
export const MOCK_SESSION_TOKEN = 'sessionToken';
export const MOCK_UNWRAP_BKEY = 'unwrapBKey';
export const MOCK_KEY_FETCH_TOKEN = 'keyFetchToken';
export const MOCK_AUTH_AT = 12345;
export const MOCK_PASSWORD = 'notYourAveragePassW0Rd';
