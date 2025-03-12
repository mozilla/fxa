/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { SmsManager, TwilioMessageStatus } from './sms.manager';
import { OtpManager } from '@fxa/shared/otp';
import { RecoveryPhoneConfig } from './recovery-phone.service.config';
import {
  PhoneNumberLookupData,
  RecoveryPhoneManager,
} from './recovery-phone.manager';
import {
  RecoveryNumberNotExistsError,
  RecoveryNumberNotSupportedError,
  RecoveryPhoneNotEnabled,
  RecoveryNumberRemoveMissingBackupCodes,
  RecoveryPhoneRegistrationLimitReached,
} from './recovery-phone.errors';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import { TwilioConfig } from './twilio.config';
import { validateRequest } from 'twilio';
import {
  createRandomFxaMessage,
  signFxaMessage,
  validateFxaSignature,
} from './util';

/** SMS message with different fallbacks for varying message sizes. */
export type FormattedMessages = {
  msg: string;
  shortMsg: string;
  failsafeMsg: string;
};

@Injectable()
export class RecoveryPhoneService {
  constructor(
    private readonly recoveryPhoneManager: RecoveryPhoneManager,
    private readonly smsManager: SmsManager,
    private readonly otpCode: OtpManager,
    private readonly config: RecoveryPhoneConfig,
    private readonly twilioConfig: TwilioConfig,
    @Inject(StatsDService) private readonly metrics: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log?: LoggerService
  ) {}

  /**
   * Checks to see if a user can set up a recovery phone number. This is based on the
   * user's region, if they have backup codes, or if they already set up a recovery phone.
   *
   * @param uid
   * @param region
   */
  public async available(uid: string, region: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.config.allowedRegions?.includes(region)) {
      return false;
    }

    const hasConfirmed = await this.hasConfirmed(uid);
    if (hasConfirmed.exists) {
      return false;
    }

    // User can set up a recovery phone if they have backup codes
    return await this.recoveryPhoneManager.hasRecoveryCodes(uid);
  }

  /**
   * Setups (ie registers) a new phone number to an account uid. Accomplishes setup
   * by sending the phone number provided an OTP code to verify.
   * @param uid The account id
   * @param phoneNumber The phone number to register
   * @param localizedMessageBody Optional localized message body
   * @returns True if code was sent and stored
   */
  public async setupPhoneNumber(
    uid: string,
    phoneNumber: string,
    getFormattedMessages: (code: string) => Promise<FormattedMessages>
  ) {
    // Check if the service has been disabled.
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    // Reject numbers that do not match our set of sanctioned prefixes.
    if (this.config.sms?.validNumberPrefixes) {
      const allowed = this.config.sms.validNumberPrefixes.some((check) => {
        return phoneNumber.startsWith(check);
      });

      if (!allowed) {
        this.metrics.increment('recovery-phone.setup.number_prefix.blocked');
        throw new RecoveryNumberNotSupportedError(phoneNumber);
      } else {
        this.metrics.increment('recovery-phone.setup.number_prefix.allowed');
      }
    }

    // Call Twilio to get some info about the number, and check if it resides in
    // a country that we support sending sms to.
    if (this.config.sms?.validCountryCodes) {
      const lookupData = await (async () => {
        try {
          return await this.smsManager.phoneNumberLookup(phoneNumber, '');
        } catch (error) {
          this.log?.error('RecoveryPhoneService.setupPhoneNumber', error);
          this.metrics.increment(
            'recovery-phone.setup.country_code.lookup_failed'
          );
          throw new RecoveryNumberNotSupportedError(phoneNumber, error);
        }
      })();

      const allowed = this.config.sms.validCountryCodes.includes(
        lookupData.countryCode
      );
      if (!allowed) {
        this.log?.log('RecoveryPhoneService.setupPhoneNumber', {
          msg: `Blocked country code ${lookupData.countryCode}.`,
        });
        this.metrics.increment('recovery-phone.setup.country_code.blocked');
        throw new RecoveryNumberNotSupportedError(phoneNumber);
      } else {
        this.metrics.increment('recovery-phone.setup.country_code.allowed');
      }
    }

    // Invalidate and remove any or all previous unconfirmed code entries
    const unconfirmedCodes =
      await this.recoveryPhoneManager.getAllUnconfirmedCodes(uid);
    for (const code of unconfirmedCodes) {
      await this.recoveryPhoneManager.removeCode(uid, code);
    }

    // Rejects the phone number if it has been registered for too many accounts
    const countByPhoneNumber =
      await this.recoveryPhoneManager.getCountByPhoneNumber(phoneNumber);

    if (
      this.config.maxRegistrationsPerNumber &&
      countByPhoneNumber >= this.config.maxRegistrationsPerNumber
    ) {
      throw new RecoveryPhoneRegistrationLimitReached(phoneNumber);
    }

    // Create a code and store it for validation later
    const code = await this.otpCode.generateCode();
    await this.recoveryPhoneManager.storeUnconfirmed(
      uid,
      code,
      phoneNumber,
      true
    );

    // Pick the message with the best length and send it
    const formattedMessages = await getFormattedMessages(code);
    const body = this.getSafeSmsBody(formattedMessages);
    const statusCallback = this.createMessageStatusCallback();
    const msg = await this.smsManager.sendSMS({
      to: phoneNumber,
      body,
      statusCallback,
    });

    // Relay status
    return this.isSuccessfulSmsSend(msg);
  }

  /**
   * Specifies the callback url to get status updates about the message delivery.
   *
   * IMPORTANT! Twilio signs messages sent to this callback url with a X-Twilio-Signature
   * header. Unfortunately, they decided to use the auth token for signature validation.
   * This means that if we decide to use api keys instead the auth token, which is best
   * practice, we can't validate the X-Twilio-Signature header.
   *
   * As a work around, we will sign the callback url ourselves. This will stop unauthorized
   * requests from being handled by our webhook. It will not, however, guard against
   * message tampering in the event of a man in the middle attack on TLS. Luckily we don't
   * use these message status updates in a critical way, so this is probably super good
   * enough.
   * @returns A webhook url
   */
  public createMessageStatusCallback() {
    let url: string | undefined;
    if (this.twilioConfig.webhookUrl) {
      // This is the way we'd like to do it. Unfortunately, this won't work with API keys...
      // We will leave it here just incase we need to support it.
      if (this.twilioConfig.authToken) {
        url = this.twilioConfig.webhookUrl;
      }

      // Here we will use our own key pair, to sign sign the callback url.
      // Not perfect, but good enough, and better than using our authToken.
      else if (this.twilioConfig.fxaPrivateKey) {
        const message = createRandomFxaMessage();
        const signature = signFxaMessage(
          this.twilioConfig.fxaPrivateKey,
          message
        );
        url =
          this.twilioConfig.webhookUrl +
          `?fxaSignature=${encodeURIComponent(signature)}` +
          `&fxaMessage=${encodeURIComponent(message)}`;
      }
    }

    // We don't have to provide a callback. If nothing is specified, we drop
    // some metrics on message delivery status ¯\_(ツ)_/¯
    return url;
  }

  public async getNationalFormat(phoneNumber: string) {
    // When the user _confirms_ their OTP code we also call the lookup endpoint to
    // store the full data returned in our DB, but we need the national format on the
    // OTP confirm page before then. "Basic lookups" from Twilio are free, so don't
    // bother persisting in redis.
    // https://www.twilio.com/en-us/user-authentication-identity/pricing/lookup
    const { nationalFormat } = await this.smsManager.phoneNumberLookup(
      phoneNumber
    );
    return nationalFormat;
  }

  /**
   * Confirms a UID code. This will also and finalizes the phone number setup if the code provided was
   * intended for phone number setup.
   * @param uid An account id
   * @param code A otp code
   * @returns True if successful
   */
  public async confirmSetupCode(uid: string, code: string) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const data = await this.recoveryPhoneManager.getUnconfirmed(uid, code);

    // If there is no data, it means there's no record of this code being sent to the uid provided
    if (data == null) {
      return false;
    }

    // The code must be intended for a setup, ie recovery phone create, action.
    if (data.isSetup !== true) {
      return false;
    }

    // Rejects the phone number if it has been registered for too many accounts
    const countByPhoneNumber =
      await this.recoveryPhoneManager.getCountByPhoneNumber(data.phoneNumber);

    if (
      this.config.maxRegistrationsPerNumber &&
      countByPhoneNumber >= this.config.maxRegistrationsPerNumber
    ) {
      throw new RecoveryPhoneRegistrationLimitReached(data.phoneNumber);
    }

    // If this was for a setup operation. Register the phone number to the uid.
    const lookupData: PhoneNumberLookupData = await (async () => {
      try {
        return await this.smsManager.phoneNumberLookup(data.phoneNumber);
      } catch (error) {
        this.log?.error('RecoveryPhoneService.confirmSetupCode', error);

        throw new RecoveryNumberNotSupportedError(data.phoneNumber, error);
      }
    })();

    // Reject numbers suspected of sim pumping
    const smsPumpingRiskThreshold = this.config.sms?.smsPumpingRiskThreshold;
    const smsPumpingRisk = lookupData?.smsPumpingRisk;
    if (
      typeof smsPumpingRiskThreshold === 'number' &&
      typeof smsPumpingRisk === 'number'
    ) {
      this.metrics.gauge('sim_pumping_risk', smsPumpingRisk);

      if (smsPumpingRisk > smsPumpingRiskThreshold) {
        this.metrics.increment('sim_pumping_risk.denied');

        const error = new RecoveryNumberNotSupportedError(
          data.phoneNumber,
          new Error('Sim pumping risk threshold exceeded')
        );
        this.log?.error('RecoveryPhoneService.smsPumpingRisk', {
          phoneNumber: data.phoneNumber,
          smsPumpingRisk,
        });

        throw error;
      } else {
        this.metrics.increment('sim_pumping_risk.allowed');
      }
    }

    await this.recoveryPhoneManager.registerPhoneNumber(
      uid,
      data.phoneNumber,
      lookupData
    );

    // The code was valid. Remove entry. It cannot be used again.
    await this.recoveryPhoneManager.removeCode(uid, code);

    // There was a record matching, the uid / code. The confirmation was successful.
    return true;
  }

  /**
   * Confirms a signin code.
   * @param uid An account id
   * @param code A otp code
   * @returns True if successful
   */
  public async confirmSigninCode(uid: string, code: string) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const data = await this.recoveryPhoneManager.getUnconfirmed(uid, code);

    // If there is no data, it means there's no record of this code being sent to the uid provided
    if (data == null) {
      return false;
    }

    // A code intended for setup, cannot be used for sign in.
    if (data.isSetup === true) {
      return false;
    }

    // The code was valid. Remove entry. It cannot be used again.
    await this.recoveryPhoneManager.removeCode(uid, code);

    return true;
  }

  /**
   * Remove phone number from an account. Each user can only have one associated
   * phone number. A user must have backup codes before removing a phone number.
   *
   * @param uid An account id
   * @returns True if successful
   */
  public async removePhoneNumber(uid: string) {
    const hasRecoveryCodes = await this.recoveryPhoneManager.hasRecoveryCodes(
      uid
    );

    // TBD: Random, obs. why do we do this? It seems like a potential edge case, what if the user
    // consumes all the recovery codes? This could then return false...
    //
    // Just curious, about the rationale surrounding why this would block a user from removing their
    // phone.
    //
    if (!hasRecoveryCodes) {
      throw new RecoveryNumberRemoveMissingBackupCodes(uid);
    }

    return await this.recoveryPhoneManager.removePhoneNumber(uid);
  }

  /**
   * Checks if the given uid has confirmed a phone number.
   * @param uid Account id
   * @param phoneNumberMask When provided will mask the number so the full value is not shown.
   * @returns If the account has confirmed, returns {exists:true, phoneNumber }. If not returns {exists:false}
   *
   * @remarks The value provided for phoneNumberMask will preserve the last N digits of of the phone number.
   * e.g. If the phone number was +15005551234 and phoneNumberMask was 4, the result would be +*******1234.
   */
  public async hasConfirmed(
    uid: string,
    phoneNumberStrip?: number
  ): Promise<{
    exists: boolean;
    phoneNumber?: string;
    nationalFormat?: string;
  }> {
    try {
      const { phoneNumber, nationalFormat } =
        await this.recoveryPhoneManager.getConfirmedPhoneNumber(uid);

      return {
        exists: true,
        phoneNumber: this.stripPhoneNumber(phoneNumber, phoneNumberStrip),
        nationalFormat: nationalFormat
          ? this.stripPhoneNumber(nationalFormat, phoneNumberStrip)
          : undefined,
      };
    } catch (err) {
      if (err instanceof RecoveryNumberNotExistsError) {
        // no-op - we handle the error, and just return false;
        return {
          exists: false,
          phoneNumber: undefined,
          nationalFormat: undefined,
        };
      }
      // Something unexpected happened...
      throw err;
    }
  }

  /**
   * Masks a phone number so as to not divulge the entire value.
   *
   * @param phoneNumber The actual phone number
   * @param lastN The last N number of digits to show
   * @returns The last N number of digits of the phone number
   */
  public stripPhoneNumber(phoneNumber: string, lastN?: number) {
    // No stripping needed, session is verified
    if (lastN === undefined) {
      return phoneNumber;
    }
    if (lastN <= 0) {
      return '';
    }

    const digits = phoneNumber.replace(/\D/g, '');
    // Clamp lastN between 0 and digits.length
    if (lastN > digits.length) {
      lastN = digits.length;
    }
    return digits.slice(-lastN);
  }

  /**
   * Sends a new totp code to a user and revokes any previous unconfirmed codes.
   *
   * @param uid Account id
   * @param getFormattedMessage Optional template function to format the message
   * @returns True if message didn't fail to send.
   */
  public async sendCode(
    uid: string,
    getFormattedMessages: (code: string) => Promise<FormattedMessages>
  ) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    // Invalidate and remove any or all previous unconfirmed code entries
    const unconfirmedCodes =
      await this.recoveryPhoneManager.getAllUnconfirmedCodes(uid);
    for (const oldCode of unconfirmedCodes) {
      await this.recoveryPhoneManager.removeCode(uid, oldCode);
    }

    // Generate a new otp code, and store it as unconfirmed for later validation
    const { phoneNumber } =
      await this.recoveryPhoneManager.getConfirmedPhoneNumber(uid);
    const code = await this.otpCode.generateCode();
    await this.recoveryPhoneManager.storeUnconfirmed(
      uid,
      code,
      phoneNumber,
      false
    );

    // Pick the message with the best length and send it
    const formattedMessages = await getFormattedMessages(code);
    const body = this.getSafeSmsBody(formattedMessages);
    const statusCallback = this.createMessageStatusCallback();
    const msg = await this.smsManager.sendSMS({
      to: phoneNumber,
      body,
      statusCallback,
    });

    // Relay status
    return this.isSuccessfulSmsSend(msg);
  }

  /**
   * Handles update about message delivery status.
   * @param messageStatus The message delivery status.
   */
  public async onMessageStatusUpdate(messageStatus: TwilioMessageStatus) {
    await this.smsManager.messageStatus(messageStatus);
  }

  /**
   * Validates webhook calls coming from twilio
   * @returns
   */
  public validateTwilioWebhookCallback({
    twilio,
    fxa,
  }: {
    twilio?: { signature: string; params: Record<string, any> };
    fxa?: { signature: string; message: string };
  }) {
    // Check flag that toggles validation of webhook calls
    if (this.twilioConfig.validateWebhookCalls === false) {
      return true;
    }

    /**
     * IMPORTANT! This is the best way to validate the web hook,
     * but the worst way to authenticate the client. We typically
     * do not want to rely on the authToken... This is being kept
     * around just in case it's needed.
     */
    if (twilio && this.twilioConfig.authToken) {
      return validateRequest(
        this.twilioConfig.authToken,
        twilio.signature,
        this.twilioConfig.webhookUrl,
        twilio.params
      );
    }

    /**
     * IMPORTANT! When using twilio api keys, we will fallback
     * to this approach. As mentioned above. It prevents bogus
     * requests, but doesn't validate the actual payload / prevent
     * message tampering. At the moment, we don't use this call back
     * for anything other metrics, so this is probably good enough.
     */
    if (fxa && this.twilioConfig.fxaPublicKey) {
      // Check the fxa signature. This validates that the signature was generated
      // using our private key.
      return validateFxaSignature(
        this.twilioConfig.fxaPublicKey,
        fxa.signature,
        fxa.message
      );
    }

    // Unless something is misconfigured, this typically won't happen. Add a log
    // just incase...
    this.log?.warn('validateTwilioCallback', {
      msg: 'Potentially invalid config or args.',
      hasFxaPublicKey: !!this.twilioConfig.fxaPublicKey,
      hasFxaSignature: !!fxa?.signature,
      hasFxaMessage: !!fxa?.message,
      hasTwilioAuthToken: !!this.twilioConfig.authToken,
      hasTwilioSignature: !!twilio?.signature,
      hasTwilioParams: !!twilio?.params,
    });
    return false;
  }

  /**
   * Gets the most appropriately sized message body. We have a certain limit
   * of sms segments that we want to allow, typically this is just a single segment.
   *
   * This function takes a message, a short message, and a fail safe message and picks
   * the most optimal one, that still fits inside the allotted message segments.
   */
  private getSafeSmsBody({ msg, shortMsg, failsafeMsg }: FormattedMessages) {
    const msgCheck = this.smsManager.checkMessageSegments(msg);

    if (!msgCheck.overLimit) {
      return msg;
    }
    this.log?.warn('RecoveryPhoneService.sendCode.overMsgSegmentLimit', {
      segmentsCount: msgCheck.segmentedMessage.segmentsCount,
      encoding: msgCheck.segmentedMessage.encoding,
    });

    const shortMsgCheck = this.smsManager.checkMessageSegments(shortMsg);
    if (!shortMsgCheck.overLimit) {
      return shortMsg;
    }
    this.log?.warn('RecoveryPhoneService.sendCode.overMsgSegmentLimit', {
      segmentsCount: msgCheck.segmentedMessage.segmentsCount,
      encoding: msgCheck.segmentedMessage.encoding,
    });

    // Final fallback.
    return failsafeMsg;
  }

  private isSuccessfulSmsSend(msg: MessageInstance) {
    if (
      msg == null ||
      msg.status === 'failed' ||
      msg.status === 'canceled' ||
      msg.status === 'undelivered'
    ) {
      return false;
    }

    // TBD: Need to check other message states?

    return true;
  }
}
