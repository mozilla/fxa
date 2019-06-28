/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('../../lib/promise');

module.exports = function sendBatch(batch, sendEmail, log) {
  let successCount = 0;
  let errorCount = 0;

  return P.all(
    batch.map(userRecord => {
      return sendEmail(userRecord).then(
        () => {
          successCount++;
          log.info({
            op: 'send.success',
            email: userRecord.email,
          });
        },
        error => {
          errorCount++;

          log.error({
            op: 'send.error',
            email: userRecord.email,
            error: error,
          });

          // swallow errors, keep sending. We'll have to resend this manually.
        }
      );
    })
  ).then(() => {
    return {
      errorCount,
      successCount,
    };
  });
};
