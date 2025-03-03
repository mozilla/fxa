/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class RecoveryPhoneServiceConfig {
  @IsArray()
  public validNumberPrefixes?: Array<string>;

  @IsNumber()
  public smsPumpingRiskThreshold?: number;
}

export class RecoveryPhoneConfig {
  @IsBoolean()
  public enabled?: boolean;

  @IsArray()
  public allowedRegions?: Array<string>;

  @IsNumber()
  public maxRegistrationsPerNumber?: number;

  @IsObject()
  public sms?: RecoveryPhoneServiceConfig;
}
