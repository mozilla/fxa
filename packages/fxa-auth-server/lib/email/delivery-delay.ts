/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles AWS SES Delivery Delay notifications from SQS.
 *
 * Delivery delays are TRANSIENT failures where email delivery is temporarily delayed
 * but may eventually succeed. This differs from bounces which are PERMANENT failures.
 * Delays can occur due to mailbox full, temporary network issues, rate limiting, etc.
 *
 * Integration Requirements:
 * - AWS SES must be configured to publish DeliveryDelay notifications to an SQS queue
 * - Environment variable DELIVERY_DELAY_QUEUE_URL must point to the queue
 * - SQS queue must have proper IAM permissions for the auth-server to consume messages
 */

import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { EventEmitter } from 'events';
import * as utils from './utils/helpers';

interface SESMailHeader {
  name: string;
  value: string;
}

interface SESMail {
  timestamp: string;
  messageId: string;
  source: string;
  headers?: SESMailHeader[];
}

interface DelayedRecipient {
  emailAddress: string;
  status?: string;
  diagnosticCode?: string;
}

/**
 * AWS SES Delivery Delay types as documented in:
 * https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html
 */
interface DeliveryDelay {
  delayType:
    | 'InternalFailure'
    | 'General'
    | 'MailboxFull'
    | 'SpamDetected'
    | 'RecipientServerError'
    | 'IPFailure'
    | 'TransientCommunicationFailure'
    | 'BYOIPHostNameLookupUnavailable'
    | 'Undetermined'
    | 'SendingDeferral';
  delayedRecipients: DelayedRecipient[];
  expirationTime?: string;
  reportingMTA?: string;
  timestamp?: string;
}

interface SESDeliveryDelayMessage {
  eventType?: 'DeliveryDelay';
  notificationType?: 'DeliveryDelay';
  deliveryDelay: DeliveryDelay;
  mail: SESMail;
  del: () => void;
}

interface SQSReceiver extends EventEmitter {
  start: () => void;
}

export = function (log: Logger, statsd: StatsD) {
  return function start(deliveryDelayQueue: SQSReceiver) {
    async function handleDeliveryDelay(message: SESDeliveryDelayMessage) {
      try {
        utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'deliveryDelay');

        // Track message age to monitor how long delays persist
        let messageAgeSeconds = 0;
        if (message.mail?.timestamp) {
          const mailTimestamp = new Date(message.mail.timestamp).getTime();
          const now = Date.now();
          messageAgeSeconds = Math.floor((now - mailTimestamp) / 1000);
          statsd.timing('email.deliveryDelay.ageSeconds', messageAgeSeconds);
        }

        statsd.increment('email.deliveryDelay.message', {
          delayType: message?.deliveryDelay?.delayType || 'none',
          hasExpiration: String(!!message?.deliveryDelay?.expirationTime),
          template: utils.getHeaderValue('X-Template-Name', message) || 'none',
        });

        let recipients: DelayedRecipient[] = [];
        if (
          message.deliveryDelay &&
          (message.eventType === 'DeliveryDelay' ||
            message.notificationType === 'DeliveryDelay')
        ) {
          recipients = message.deliveryDelay.delayedRecipients || [];
        }

        const templateName = utils.getHeaderValue('X-Template-Name', message);
        const language = utils.getHeaderValue('Content-Language', message);
        const delayType = message.deliveryDelay?.delayType;
        const expirationTime = message.deliveryDelay?.expirationTime;
        const reportingMTA = message.deliveryDelay?.reportingMTA;
        const timestamp = message.deliveryDelay?.timestamp;

        for (const recipient of recipients) {
          const email = recipient.emailAddress;
          const emailDomain = utils.getAnonymizedEmailDomain(email);
          const logData: {
            email: string;
            domain: string;
            delayType?: DeliveryDelay['delayType'];
            status?: string;
            diagnosticCode?: string;
            template?: string;
            lang?: string;
            expirationTime?: string;
            reportingMTA?: string;
            timestamp?: string;
            messageAgeSeconds?: number;
          } = {
            email: email,
            domain: emailDomain,
            delayType: delayType,
          };

          if (recipient.status) {
            logData.status = recipient.status;
          }
          if (recipient.diagnosticCode) {
            logData.diagnosticCode = recipient.diagnosticCode;
          }

          if (templateName) {
            logData.template = templateName;
          }

          if (language) {
            logData.lang = language;
          }

          if (expirationTime) {
            logData.expirationTime = expirationTime;
          }

          if (reportingMTA) {
            logData.reportingMTA = reportingMTA;
          }

          if (timestamp) {
            logData.timestamp = timestamp;
          }

          if (messageAgeSeconds > 0) {
            logData.messageAgeSeconds = messageAgeSeconds;
          }

          utils.logAccountEventFromMessage(message, 'emailDelayed');

          log.info('handleDeliveryDelay', logData);
        }

        message.del();
      } catch (err) {
        // Log error but still delete message to prevent infinite retry loop
        log.error('handleDeliveryDelay.error', {
          err: err,
          messageId: message?.mail?.messageId,
        });
        statsd.increment('email.deliveryDelay.error');
        message.del();
      }
    }

    deliveryDelayQueue.on('data', handleDeliveryDelay);
    deliveryDelayQueue.start();

    return {
      deliveryDelayQueue: deliveryDelayQueue,
      handleDeliveryDelay: handleDeliveryDelay,
    };
  };
};
