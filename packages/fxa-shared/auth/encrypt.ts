/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import crypto from 'crypto';

const buf = require('buf');

export const hex = buf.hex;

export function hash(value: any) {
  var sha = crypto.createHash('sha256');
  sha.update(hex(value));
  return sha.digest();
}
