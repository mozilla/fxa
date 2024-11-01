/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsArray, IsNumber, IsString } from 'class-validator';

export class SmsManagerConfig {
  /**
   * The number that SMS are sent from. This should be our number.
   * */
  @IsString()
  public readonly from!: string;

  @IsNumber()
  public readonly maxMessageLength!: number;

  @IsArray()
  public readonly validNumberPrefixes!: Array<string>;
}
