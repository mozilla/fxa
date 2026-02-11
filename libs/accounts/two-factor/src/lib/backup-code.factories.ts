/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { RecoveryCode } from './backup-code.types';

export const RecoveryCodeFactory = (
  override?: Partial<RecoveryCode>
): RecoveryCode => ({
  uid: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  codeHash: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  salt: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  ...override,
});
