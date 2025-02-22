/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { Twilio } from 'twilio';
import {
  MessageInstance,
  MessageStatus,
} from 'twilio/lib/rest/api/v2010/account/message';
import { SmsManagerConfig } from './sms.manager.config';
import { TwilioProvider } from './twilio.provider';
import {
  RecoveryNumberInvalidFormatError,
  RecoveryNumberNotSupportedError,
  SmsSendRateLimitExceededError,
  TwilioErrorCodes,
} from './recovery-phone.errors';

export type TwilioMessageStatus = {
  AccountSid: string;
  From: string;
  MessageSid: string;
  MessageStatus: MessageStatus;
  // Only present if status is failed or undelivered
  ErrorCode?: string;
  // Probably present if status is delivered or undelivered
  RawDlrDoneDate?: string;
};

@Injectable()
export class SmsManager {
  private currentPhoneNumber = 0;

  constructor(
    @Inject(TwilioProvider) private readonly client: Twilio,
    @Inject(StatsDService) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log: LoggerService,
    private readonly config: SmsManagerConfig
  ) {}

  public async phoneNumberLookup(phoneNumber: string) {
    try {
      this.metrics.increment('sms.phoneNumberLookup.start');
      const result = await this.client.lookups.v2
        .phoneNumbers(phoneNumber)
        .fetch({ fields: this.config.extraLookupFields.join(',') });

      this.metrics.increment('sms.phoneNumberLookup.success');

      /**
       * See https://www.twilio.com/docs/lookup/v2-api/sim-swap for more details
       * on the sim swap object returned by Twilio. We currently track only
       * the last sim swap period.
       */
      const simSwapPeriod = result.simSwap?.lastSimSwap?.swappedPeriod;
      if (simSwapPeriod) {
        this.metrics.increment('sms.phoneNumberLookup.success.simSwap', {
          period: simSwapPeriod,
        });
      }
      const smsPumpingRisk = result?.smsPumpingRisk?.smsPumpingRiskScore;
      if (smsPumpingRisk) {
        this.metrics.histogram(
          'sms.phoneNumberLookup.success.smsPumpingRisk',
          smsPumpingRisk
        );
      }
      const phoneNumberQualityScore = result.phoneNumberQualityScore;
      if (phoneNumberQualityScore) {
        this.metrics.histogram(
          'sms.phoneNumberLookup.success.phoneNumberQualityScore',
          phoneNumberQualityScore
        );
      }

      // Calling toJSON converts PhoneNumberInstance into a
      // object that just holds state and can be serialized.
      return result.toJSON();
    } catch (err) {
      this.metrics.increment('sms.phoneNumberLookup.failure');
      throw err;
    }
  }

  public async sendSMS({
    to,
    body,
    uid,
  }: {
    to: string;
    body: string;
    uid?: string;
  }) {
    if (body.length > this.config.maxMessageLength) {
      throw new Error(
        `Body cannot be greater than ${this.config.maxMessageLength} characters.`
      );
    }

    if (this.config.validNumberPrefixes) {
      if (
        !this.config.validNumberPrefixes.some((prefix) => to.startsWith(prefix))
      ) {
        throw new RecoveryNumberNotSupportedError(to);
      }
    }

    return await this._sendSMS(to, body, uid, 0);
  }

  private async _sendSMS(
    to: string,
    body: string,
    uid: string | undefined,
    retryCount: number
  ): Promise<MessageInstance> {
    const from = this.rotateFromNumber();

    try {
      // Validate the `to` phone number and send the SMS
      const msg = await this.client.messages.create({
        to,
        from,
        body,
      });
      // Typically the message will be in queued status. The following metric and log
      // can help track or debug send problems.
      this.metrics.increment('sms.send.' + msg.status);
      this.log.log('SMS sent', {
        sid: msg.sid,
        status: msg.status,
      });
      return msg;
    } catch (err) {
      if (err.code === TwilioErrorCodes.SMS_SEND_RATE_LIMIT_EXCEEDED) {
        if (retryCount < this.config.maxRetries) {
          // Exp back off and try again
          await new Promise((r) =>
            setTimeout(r, Math.pow(2, retryCount++) * 1000)
          );
          return await this._sendSMS(to, body, uid, retryCount);
        }
      }

      this.metrics.increment('sms.send.error');

      if (err.code === TwilioErrorCodes.INVALID_TO_PHONE_NUMBER) {
        throw new RecoveryNumberInvalidFormatError(uid || '', to, err);
      }
      if (err.code === TwilioErrorCodes.SMS_SEND_RATE_LIMIT_EXCEEDED) {
        throw new SmsSendRateLimitExceededError(uid || '', to, from, err);
      }
      throw err;
    }
  }

  public rotateFromNumber() {
    return this.config.from[
      this.currentPhoneNumber++ % this.config.from.length
    ];
  }

  public messageStatus(messageStatus: TwilioMessageStatus) {
    // Keep tabs on the delivery status
    this.metrics.increment(
      `recovery-phone.message.status.${messageStatus.MessageStatus}`
    );

    // Track specific error codes rates
    if (messageStatus.ErrorCode) {
      this.metrics.increment(
        `recovery-phone.message.status.error.${messageStatus.ErrorCode}`
      );
    }

    // Only write log entries for certain statuses.
    switch (messageStatus.MessageStatus) {
      case 'queued':
      case 'sending':
      case 'sent':
      case 'receiving':
      case 'received':
      case 'accepted':
      case 'scheduled':
      case 'read':
      case 'partially_delivered':
      case 'canceled':
        // no-op
        break;

      case 'failed':
      case 'undelivered':
      case 'delivered':
        const opts: any = {
          From: messageStatus.From,
          MessageSid: messageStatus.MessageSid,
        };
        if (messageStatus.ErrorCode) {
          opts.ErrorCode = messageStatus.ErrorCode;
        }
        if (messageStatus.RawDlrDoneDate) {
          opts.RawDlrDoneDate = messageStatus.RawDlrDoneDate;
        }
        this.log.log(
          `recovery-phone.message.status.${messageStatus.MessageStatus}`,
          opts
        );
        break;
    }
  }
}
