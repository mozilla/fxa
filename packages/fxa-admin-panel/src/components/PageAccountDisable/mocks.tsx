/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountDisableResponse,
  AccountDisableStatus,
} from 'fxa-admin-server/src/types';

export const mockDisableResults: AccountDisableResponse[] = [
  { locator: 'foo@example.com', status: AccountDisableStatus.Success },
  { locator: 'nobody@example.com', status: AccountDisableStatus.NoAccount },
  {
    locator: 'f9416ce3703e4916a4cd6b1e665a3f1a',
    status: AccountDisableStatus.Failure,
  },
];
