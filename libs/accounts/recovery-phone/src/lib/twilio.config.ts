/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString } from 'class-validator';

/**
 * Configuration for twilio client. See twilio SDK docs for more details.
 */
export class TwilioConfig {
  @IsString()
  accountSid!: string;
  @IsString()
  authToken!: string;
}
