/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { SmsManagerConfig } from './sms.manager.config';
import { TwilioProvider } from './twilio.provider';
import {
  RecoveryNumberInvalidFormatError,
  RecoveryNumberNotSupportedError,
  SmsSendRateLimitExceededError,
  TwilioErrorCodes,
} from './recovery-phone.errors';

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
    const result = await this.client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: this.config.extraLookupFields.join(',') });
    // Calling toJSON converts PhoneNumberInstance into a
    // object that just holds state and can be serialized.
    return result.toJSON();
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
}
