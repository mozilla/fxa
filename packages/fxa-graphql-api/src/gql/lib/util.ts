/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ILogger } from 'fxa-shared/log';

// Temporary sanity check! Will be removed asap.
export function checkForwardedFor(
  log: ILogger,
  method: string,
  headers: Headers
) {
  if (!headers) {
    log.warn('checkForwardedFor', {
      msg: `${method} > headers missing!`,
    });
    return;
  }

  const xForwardedFor = headers.get('x-forwarded-for');
  if (!xForwardedFor) {
    log.warn('checkForwardedFor', {
      msg: `${method} > missing x-forwarded-for header!`,
    });
  } else {
    log.info('checkForwardedFor', {
      msg: `${method} > received headers: x-forwarded-for: ${headers.get(
        'x-forwarded-for'
      )}`,
    });
  }
}
