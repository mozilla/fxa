/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  generateRecoveryCodes as realGenerateRecoveryCodes,
  checkCode as realCheckCode,
} from './totp';
import { getCode as realGetCode } from './totp';

export const totpUtils = {
  checkCode: (...args: Parameters<typeof realCheckCode>) =>
    realCheckCode(...args),

  getCode: (...args: Parameters<typeof realGetCode>) => realGetCode(...args),

  generateRecoveryCodes: (
    ...args: Parameters<typeof realGenerateRecoveryCodes>
  ) => realGenerateRecoveryCodes(...args),
};
