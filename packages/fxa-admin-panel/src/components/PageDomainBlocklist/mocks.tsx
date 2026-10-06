/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DomainBlocklistEntry } from 'fxa-admin-server/src/types';

export const mockDomainBlocklist: DomainBlocklistEntry[] = [
  { domain: 'example.com', createdAt: 1700000000000 },
  { domain: 'example.net', createdAt: 1700100000000 },
];
