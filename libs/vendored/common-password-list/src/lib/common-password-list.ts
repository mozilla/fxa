/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { decode } from '@fxa/vendored/incremental-encoder';

import { encodedPasswords } from './encoded-passwords';

const commonPasswords = decode(encodedPasswords.split('\n'));

export const test = (password: string) => {
  return commonPasswords.indexOf(password) > -1;
};
