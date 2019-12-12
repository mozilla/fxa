/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const utils = require('./utils/helpers');

// Account deletion threshold for new unverified accounts that receive
// a bounce or complaint notification. Unverified accounts younger than
// 6 hours old will be deleted if a bounce or complaint occurs.
const SIX_HOURS = 1000 * 60 * 60 * 6;

module.exports = (log, error) => {
  return (queue, db) => {
    queue.start();

    queue.on('data', async message => {
      try {
        utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'notification');

        let addresses = [],
          eventType = 'bounced',
          isDeletionCandidate = false;
        if (message.bounce) {
          addresses = message.bounce.bouncedRecipients;
          isDeletionCandidate = true;
        } else if (message.complaint) {
          addresses = message.complaint.complainedRecipients;
          isDeletionCandidate = true;
        } else if (message.delivery) {
          addresses = message.delivery.recipients;
          eventType = 'delivered';
        }

        await Promise.all(
          addresses.map(async address => {
            const domain = utils.getAnonymizedEmailDomain(address);

            utils.logFlowEventFromMessage(log, message, eventType);
            utils.logEmailEventFromMessage(log, message, eventType, domain);

            if (isDeletionCandidate) {
              const emailRecord = await db.accountRecord(address);

              if (
                !emailRecord.emailVerified &&
                emailRecord.createdAt >= Date.now() - SIX_HOURS
              ) {
                // A bounce or complaint on a new unverified account is grounds for deletion
                await db.deleteAccount(emailRecord);

                log.info('accountDeleted', { ...emailRecord });
              }
            }
          })
        );
      } catch (err) {
        log.error('email.notification.error', { err });
      }

      message.del();
    });
  };
};
