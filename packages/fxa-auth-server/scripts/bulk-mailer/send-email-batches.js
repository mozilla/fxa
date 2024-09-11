/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sendEmailBatch from './send-email-batch';

/**
 * Send batches of emails.
 *
 * @param {Object[][]} userRecordBatches batches of user records to send emails to
 * @param {Number} batchDelayMS delay between each batch
 * @param {Function} sendEmail function that sends the email, called with one userRecord
 * @param {Object} log logger
 * @param {Boolean} [isTest=false] is this a test run?
 */
export default async function (
  userRecordBatches,
  batchDelayMS,
  sendEmail,
  log,
  isTest
) {
  let successCount = 0;
  let errorCount = 0;
  const lastBatchIndex = userRecordBatches.length - 1;
  const totalCount = countEmails(userRecordBatches);

  logBegin(log, countEmails(userRecordBatches), isTest);
  try {
    let index = 0;
    for (const currentBatch of userRecordBatches) {
      const result = await sendEmailBatch(currentBatch, sendEmail, log);
      successCount += result.successCount;
      errorCount += result.errorCount;

      if (index !== lastBatchIndex) {
        // no delay on the last batch, with the
        // effect that a lone batch has no delay
        await new Promise((ok) => setTimeout(ok, batchDelayMS));
      }
      index++;
    }
  } catch (err) {
    // abort run
  }
  logComplete(
    log,
    successCount,
    errorCount,
    totalCount - successCount - errorCount
  );
}

function countEmails(emailBatches) {
  return emailBatches.reduce((total, batch) => (total += batch.length), 0);
}

function logBegin(log, count, isTest) {
  log.info({
    op: 'send.begin',
    count,
    test: isTest,
  });
}

function logComplete(log, successCount, errorCount, unsentCount) {
  log.info({
    op: 'send.complete',
    count: errorCount + successCount + unsentCount,
    errorCount,
    successCount,
    unsentCount,
  });
}
