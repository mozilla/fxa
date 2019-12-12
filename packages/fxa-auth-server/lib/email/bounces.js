/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const eaddrs = require('email-addresses');
const utils = require('./utils/helpers');
const isValidEmailAddress = require('./../routes/validators')
  .isValidEmailAddress;
const SIX_HOURS = 1000 * 60 * 60 * 6;

module.exports = function(log, error) {
  return function start(bounceQueue, db) {
    function accountDeleted(uid, email) {
      log.info('accountDeleted', { uid: uid, email: email });
    }

    function gotError(email, err) {
      log.error('databaseError', { email: email, err: err });
    }

    function findEmailRecord(email) {
      return db.accountRecord(email);
    }

    function recordBounce(bounce) {
      return db.createEmailBounce(bounce);
    }

    async function deleteAccountIfUnverifiedNew(record) {
      // if account is not verified and younger than 6 hours then delete it.
      if (
        !record.emailVerified &&
        record.createdAt &&
        record.createdAt > Date.now() - SIX_HOURS
      ) {
        try {
          await db.deleteAccount(record);
        } catch (err) {
          return gotError(record.email, err);
        }
        accountDeleted(record.uid, record.email);
      }
    }

    async function handleBounce(message) {
      utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'bounce');

      let recipients = [];
      // According to the AWS SES docs, a notification will never
      // include multiple types, so it's fine for us to check for
      // EITHER bounce OR complaint here.
      if (message.bounce) {
        recipients = message.bounce.bouncedRecipients;
      } else if (message.complaint) {
        recipients = message.complaint.complainedRecipients;
      }

      // SES can now send custom headers if enabled on topic.
      // Headers are stored as an array of name/value pairs.
      // Log the `X-Template-Name` header to help track the email template that bounced.
      // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
      const templateName = utils.getHeaderValue('X-Template-Name', message);
      const language = utils.getHeaderValue('Content-Language', message);

      for (const recipient of recipients) {
        // The email address in the bounce message has been handled by an external
        // system, and depending on the system it can have had some strange things
        // done to it.  Try to normalize as best we can.
        let email;
        let emailIsValid = true;
        const parsedAddress = eaddrs.parseOneAddress(recipient.emailAddress);
        if (parsedAddress !== null) {
          email = parsedAddress.address;
        } else {
          email = recipient.emailAddress;
          if (!isValidEmailAddress(email)) {
            emailIsValid = false;
            // We couldn't make the recipient address look like a valid email.
            // Log a warning but don't error out because we still want to
            // emit flow metrics etc.
            log.warn('handleBounce.addressParseFailure', {
              email: email,
              action: recipient.action,
              diagnosticCode: recipient.diagnosticCode,
            });
          }
        }
        const emailDomain = utils.getAnonymizedEmailDomain(email);
        const logData = {
          action: recipient.action,
          email: email,
          domain: emailDomain,
          bounce: !!message.bounce,
          diagnosticCode: recipient.diagnosticCode,
          status: recipient.status,
        };
        const bounce = {
          email: email,
        };

        // Template name corresponds directly with the email template that was used
        if (templateName) {
          logData.template = templateName;
        }

        if (language) {
          logData.lang = language;
        }

        // Log the type of bounce that occurred
        // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types
        if (message.bounce && message.bounce.bounceType) {
          bounce.bounceType = logData.bounceType = message.bounce.bounceType;

          if (message.bounce.bounceSubType) {
            bounce.bounceSubType = logData.bounceSubType =
              message.bounce.bounceSubType;
          }
        } else if (message.complaint) {
          // Log the type of complaint and userAgent reported
          logData.complaint = !!message.complaint;
          bounce.bounceType = 'Complaint';

          if (message.complaint.userAgent) {
            logData.complaintUserAgent = message.complaint.userAgent;
          }

          if (message.complaint.complaintFeedbackType) {
            bounce.bounceSubType = logData.complaintFeedbackType =
              message.complaint.complaintFeedbackType;
          }
        }

        // Log the bounced flowEvent and emailEvent metrics
        utils.logFlowEventFromMessage(log, message, 'bounced');
        utils.logEmailEventFromMessage(log, message, 'bounced', emailDomain);
        log.info('handleBounce', logData);

        /**
         * Docs: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types
         * Bug: https://github.com/mozilla/fxa-content-server/issues/5629
         *
         * If there is any type of bounce then suggest account for deletion.
         * Code below will fetch the email record and if it is an unverified new account then it will delete
         * the account.
         */
        const suggestAccountDeletion = !!bounce.bounceType;
        const work = [];

        if (emailIsValid) {
          work.push(recordBounce(bounce).catch(gotError.bind(null, email)));
          if (suggestAccountDeletion) {
            work.push(
              findEmailRecord(email).then(
                deleteAccountIfUnverifiedNew,
                gotError.bind(null, email)
              )
            );
          }
        }

        await Promise.all(work);
      }

      // We always delete the message, even if handling some addrs failed.
      message.del();
    }

    bounceQueue.on('data', handleBounce);
    bounceQueue.start();

    return {
      bounceQueue: bounceQueue,
      handleBounce: handleBounce,
    };
  };
};
