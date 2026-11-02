/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { StatsD } from 'hot-shots';
import * as eaddrs from 'email-addresses';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { StripeHelper } from '../payments/stripe';
import { ConfigType } from '../../config';
import { DB } from '../db';
import { AuthLogger } from '../types';
import { isValidEmailAddress } from '../routes/validators';
import * as utils from './utils/helpers';
import { SESMail, SQSReceiver } from './ses-types';

const SIX_HOURS = 1000 * 60 * 60 * 6;

// https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html#bounce-object
interface BouncedRecipient {
  emailAddress: string;
  action?: string;
  status?: string;
  diagnosticCode?: string;
}

interface SESBounce {
  bounceType: 'Undetermined' | 'Permanent' | 'Transient';
  bounceSubType:
    | 'Undetermined'
    | 'General'
    | 'NoEmail'
    | 'Suppressed'
    | 'OnAccountSuppressionList'
    | 'UnsubscribedRecipient'
    | 'MailboxFull'
    | 'MessageTooLarge'
    | 'ContentRejected'
    | 'AttachmentRejected';
  bouncedRecipients: BouncedRecipient[];
}

// https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html#complaint-object
interface SESComplaint {
  complainedRecipients: Pick<BouncedRecipient, 'emailAddress'>[];
  userAgent?: string;
  complaintFeedbackType?:
    | 'abuse'
    | 'auth-failure'
    | 'fraud'
    | 'not-spam'
    | 'other'
    | 'virus';
}

interface SESBounceMessage {
  bounce?: SESBounce;
  complaint?: SESComplaint;
  mail?: SESMail;
  diagnosticCode?: string;
  del: () => void;
}

interface BounceRecord {
  email: string;
  diagnosticCode?: string;
  templateName?: string;
  bounceType?: SESBounce['bounceType'] | 'Complaint';
  bounceSubType?:
    | SESBounce['bounceSubType']
    | SESComplaint['complaintFeedbackType'];
}

type BounceDB = Pick<
  DB,
  'accountRecord' | 'createEmailBounce' | 'deleteAccount'
>;
type AccountRecord = Awaited<ReturnType<DB['accountRecord']>>;

export = function (
  log: AuthLogger,
  error: unknown,
  config: ConfigType,
  statsd: StatsD
) {
  const stripeHelper = Container.get(StripeHelper);

  return function start(bounceQueue: SQSReceiver, db: BounceDB) {
    function logBounceMessage(message: SESBounceMessage) {
      try {
        log.debug('bounceMessage', { message: JSON.stringify(message) });
      } catch {
        log.debug('bounceMessage', {
          message: 'Could not stringify bounce message.',
        });
      }
    }

    function gotError(email: string, err: unknown) {
      log.error('databaseError', { email: email, err: err });
    }

    function findEmailRecord(email: string) {
      return db.accountRecord(email);
    }

    function recordBounce(bounce: BounceRecord) {
      // EmailBounce.create stores a missing template or type as its default.
      return db.createEmailBounce(
        bounce as Parameters<DB['createEmailBounce']>[0]
      );
    }

    async function deleteAccountIfUnverifiedNew(record: AccountRecord) {
      let success = false;
      let error: (Error & { stackTrace?: string }) | null = null;

      // Checks
      const accountDeleteEnabled = config.smtp.bounces.deleteAccount;
      const emailUnverified = !record.emailVerified;
      const isRecentAccount =
        record.createdAt && record.createdAt > Date.now() - SIX_HOURS;
      const hasNoActiveSubscription =
        !(await stripeHelper.hasActiveSubscription(record.uid));

      // if account is not verified and younger than 6 hours then delete it.
      if (
        accountDeleteEnabled &&
        emailUnverified &&
        isRecentAccount &&
        hasNoActiveSubscription
      ) {
        try {
          await db.deleteAccount(record, ReasonForDeletion.EmailBounce);
          log.info('accountDeleted', { uid: record.uid, email: record.email });
          success = true;
        } catch (err) {
          error = err as Error;
          gotError(record.email, err);
        }
      }

      // Account deletion never occurred, log account info and reasons
      if (!success) {
        log.debug('accountNotDeleted', {
          uid: record.uid,
          email: record.email,
          accountDeleteEnabled,
          emailUnverified,
          isRecentAccount,
          hasNoActiveSubscription,
          errorMessage: error?.message,
          errorStackTrace: error?.stackTrace,
        });
      }
    }

    async function handleBounce(message: SESBounceMessage) {
      logBounceMessage(message);

      statsd.increment('email.bounce.message', {
        bounceType: message?.bounce?.bounceType || 'none',
        bounceSubType: message?.bounce?.bounceSubType || 'none',
        hasDiagnosticCode: String(!!message?.diagnosticCode),
        hasComplaint: String(!!message?.complaint),
      });

      utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'bounce');

      let recipients: BouncedRecipient[] = [];
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
        let email: string;
        let emailIsValid = true;
        const parsedAddress = eaddrs.parseOneAddress(recipient.emailAddress);
        if (parsedAddress !== null) {
          email = (parsedAddress as eaddrs.ParsedMailbox).address;
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
        const logData: {
          action?: string;
          email: string;
          domain: string;
          bounce: boolean;
          diagnosticCode?: string;
          mailStatus?: string;
          template?: string;
          lang?: string;
          bounceType?: SESBounce['bounceType'];
          bounceSubType?: SESBounce['bounceSubType'];
          complaint?: boolean;
          complaintUserAgent?: string;
          complaintFeedbackType?: SESComplaint['complaintFeedbackType'];
        } = {
          action: recipient.action,
          email: email,
          domain: emailDomain,
          bounce: !!message.bounce,
          diagnosticCode: recipient.diagnosticCode,
          mailStatus: recipient.status,
        };
        const bounce: BounceRecord = {
          email: email,
          diagnosticCode: recipient.diagnosticCode,
        };

        // Template name corresponds directly with the email template that was used
        if (templateName) {
          logData.template = templateName;
          bounce.templateName = templateName;
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
        utils.logAccountEventFromMessage(message, 'emailBounced');

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
        const work: Promise<unknown>[] = [];

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
