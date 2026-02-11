/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { v5 as uuidv5 } from 'uuid';

export function generateNimbusId(namespace: string, id?: string) {
  if (id) {
    return uuidv5(id, namespace);
  } else {
    return `guest-${crypto.randomUUID()}`;
  }
}
