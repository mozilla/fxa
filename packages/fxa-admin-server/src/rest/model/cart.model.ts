/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class TaxAddress {
  public countryCode!: string;

  public postalCode!: string;
}

export class Cart {
  public id!: string;

  public uid?: string;

  public state!: string;

  public errorReasonId?: string;

  public offeringConfigId!: string;

  public interval!: string;

  public experiment?: string;

  public taxAddress?: TaxAddress;

  public currency?: string;

  public createdAt!: number;

  public updatedAt!: number;

  public couponCode?: string;

  public stripeCustomerId?: string;

  public stripeSubscriptionId?: string;

  public amount!: number;

  public version!: number;

  public eligibilityStatus!: string;
}
