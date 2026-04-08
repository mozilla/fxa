/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class SecurityEvents {
  public uid!: string;

  public nameId!: number;

  public verified!: boolean;

  public ipAddrHmac!: string;

  public createdAt!: number;

  public tokenVerificationId!: string;

  public name!: string;

  public ipAddr!: string;

  additionalInfo?: string;
}
