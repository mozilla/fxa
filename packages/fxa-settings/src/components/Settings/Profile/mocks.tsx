/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from '../../../models';
import { mockEmail } from '../../../models/mocks';

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
  avatar: { id: 'abc123', url: 'http://placekitten.com/512/512' },
  primaryEmail: mockEmail(),
  emails: [mockEmail(), mockEmail('johndope2@example.com', false)],
} as unknown as Account;
