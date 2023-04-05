/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from 'fxa-settings/src/models';
import {
  mockEmail,
  mockSession,
  MOCK_PROFILE_INFO,
} from 'fxa-settings/src/models/mocks';

export const MOCK_PROFILE_WITH_RESEND_SUCCESS = {
  getProfileInfo: () => Promise.resolve(MOCK_PROFILE_INFO),
  sendVerificationCode: () => Promise.resolve({}),
  primaryEmail: mockEmail('blabidi@blabidiboop.com', true, false),
} as unknown as Account;

export const MOCK_PROFILE_WITH_RESEND_ERROR = {
  getProfileInfo: () => Promise.resolve(MOCK_PROFILE_INFO),
  sendVerificationCode: () => Promise.reject(Error),
  primaryEmail: mockEmail('blabidi@blabidiboop.com', true, false),
} as unknown as Account;

export const MOCK_UNVERIFIED_SESSION = mockSession(false);

export const MOCK_VERIFIED_SESSION = mockSession(true);

export const MOCK_SESSION_TOKEN = 'abc123';
