/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { createHash } from 'crypto';

export function generateIdempotencyKey(params: string[]) {
  const sha = createHash('sha256');
  sha.update(params.join(''));
  return sha.digest('base64url');
}
