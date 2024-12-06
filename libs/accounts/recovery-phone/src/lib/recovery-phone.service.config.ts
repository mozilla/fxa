/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsArray, IsBoolean, IsObject } from 'class-validator';

export class RecoveryPhoneServiceConfig {
  @IsArray()
  public validNumberPrefixes?: Array<string>;
}

export class RecoveryPhoneConfig {
  @IsBoolean()
  public enabled?: boolean;

  @IsArray()
  public allowedRegions?: Array<string>;

  @IsObject()
  public sms?: RecoveryPhoneServiceConfig;
}
