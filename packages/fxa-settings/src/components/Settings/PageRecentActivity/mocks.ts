/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SecurityEventName } from './SecurityEvent';

// One mock event per mapped event name so coverage stays in sync with the
// SecurityEventName enum when new events are added.
export const MOCK_SECURITY_EVENTS = Object.values(SecurityEventName).map(
  (name) => ({
    name,
    createdAt: Date.now(),
    verified: true,
  })
);
