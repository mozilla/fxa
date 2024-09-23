/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import error from '../../error';

const BOUNCE_ERRORS = new Set([
  error.ERRNO.BOUNCE_COMPLAINT,
  error.ERRNO.BOUNCE_HARD,
  error.ERRNO.BOUNCE_SOFT,
]);

export default {
  sendError(err, isNewAddress) {
    if (err && BOUNCE_ERRORS.has(err.errno)) {
      return err;
    }

    return error.cannotSendEmail(isNewAddress);
  },
};
