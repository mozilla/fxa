/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { EventEmitter } from 'events';
const utils = require('./utils/helpers');

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
      utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'deliveryDelay');

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

        utils.logAccountEventFromMessage(message, 'emailDelayed');

        log.info('handleDeliveryDelay', logData);
      }

      message.del();
    }

    deliveryDelayQueue.on('data', handleDeliveryDelay);
    deliveryDelayQueue.start();

    return {
      deliveryDelayQueue: deliveryDelayQueue,
      handleDeliveryDelay: handleDeliveryDelay,
    };
  };
};
