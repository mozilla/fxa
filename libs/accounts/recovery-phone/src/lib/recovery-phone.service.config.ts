/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class RecoveryPhoneServiceConfig {
  /**
   * A set of valid phone number prefix that sms can be sent to. e.g. +1
   */
  @IsArray()
  public validNumberPrefixes?: Array<string>;

  /**
   * A set of valid country codes that SMS can be sent to.
   */
  @IsArray()
  public validCountryCodes!: Array<string>;

  /**
   * The max sms pumping risk score accepted.
   */
  @IsNumber()
  public smsPumpingRiskThreshold?: number;
}

export class RecoveryPhoneConfig {
  /**
   * Whether or not the recovery phone feature is supported.
   */
  @IsBoolean()
  public enabled?: boolean;

  /**
   * These are a set of allowed regions based on IP that are accepted for recovery phone setup.
   */
  @IsArray()
  public allowedRegions?: Array<string>;

  /**
   * Total number of registrations a single number can have
   */
  @IsNumber()
  public maxRegistrationsPerNumber?: number;

  /**
   * SMS specific config
   */
  @IsObject()
  public sms?: RecoveryPhoneServiceConfig;
}
