/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsBoolean, IsString } from 'class-validator';

/**
 * Configuration for twilio client. See twilio SDK docs for more details.
 */
export class TwilioConfig {
  /**
   * The twilio account sid
   */
  @IsString()
  accountSid!: string;

  /**
   * The twilio auth token. Note that this, or an apiKey/apiSecret must be set!
   * Using the auth token is not preferred.
   */
  @IsString()
  authToken?: string;

  /**
   * The webhook url that twilio will deliver status updates about messages to.
   */
  @IsString()
  webhookUrl!: string;

  /**
   * Flag that toggles on / off webhook validation.
   */
  @IsBoolean()
  validateWebhookCalls!: boolean;

  /**
   * A twilio apiKey. Works in conjunction with apiSecret. This is the preferred path for client authentication.
   */
  @IsString()
  apiKey?: string;

  /**
   * A twilio apiSecret. Works in conjunction with apiKey. This is the preferred path for client authentication.
   */
  @IsString()
  apiSecret?: string;

  /**
   * A public key for validating webhook messages. Works in conjunction with fxaPrivateKey.
   */
  @IsString()
  fxaPublicKey?: string;

  /**
   * A private key for signing webhook message callback urls. Works in conjunction with fxaPublicKey.
   */
  @IsString()
  fxaPrivateKey?: string;
}
