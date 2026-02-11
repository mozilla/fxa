/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from '../../../models';
import { mockEmail } from '../../../models/mocks';
import { MOCK_AVATAR_NON_DEFAULT } from '../../../pages/mocks';

export const MOCK_PROFILE_EMPTY = {
  displayName: null,
  avatar: { id: null, url: null },
  primaryEmail: mockEmail(),
  emails: [mockEmail()],
} as unknown as Account;

export const MOCK_PROFILE_UNCONFIRMED_FEATURES = {
  ...MOCK_PROFILE_EMPTY,
  emails: [mockEmail(), mockEmail('johndope2@example.com', false, false)],
} as unknown as Account;

export const MOCK_PROFILE_ALL = {
  displayName: 'John Dope',
  avatar: MOCK_AVATAR_NON_DEFAULT,
  primaryEmail: mockEmail(),
  emails: [mockEmail(), mockEmail('johndope2@example.com', false)],
} as unknown as Account;
