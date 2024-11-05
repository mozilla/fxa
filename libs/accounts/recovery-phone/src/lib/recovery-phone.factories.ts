/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { RecoveryPhone } from './recovery-phone.types';

export const RecoveryPhoneFactory = (override?: Partial<RecoveryPhone>) => ({
  uid: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  phoneNumber: faker.phone.number({ style: 'international' }),
  createdAt: Date.now(),
  lastConfirmed: Date.now(),
  lookupData: JSON.stringify({
    a: 'test',
    b: 'test2',
  }),
  ...override,
});
