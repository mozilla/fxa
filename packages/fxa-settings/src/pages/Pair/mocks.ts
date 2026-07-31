/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { SignedInUser } from '../../lib/channels/firefox';
import { MOCK_ACCOUNT } from '../../models/mocks';

/** The browser account the authority pages read over the WebChannel. */
export const MOCK_AUTHORITY_ACCOUNT: SignedInUser = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  sessionToken: 'a'.repeat(64),
  uid: 'f9416ce3703e4916a4cd6b1e665a3f1a',
  verified: true,
};
