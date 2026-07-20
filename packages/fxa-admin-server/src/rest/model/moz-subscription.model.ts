/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class MozSubscription {
  public created!: number;

  public currentPeriodEnd!: number;

  public currentPeriodStart!: number;

  public cancelAtPeriodEnd!: boolean;

  public endedAt?: number;

  public latestInvoice!: string;

  public manageSubscriptionLink?: string;

  public planId!: string;

  public productName!: string;

  public productId!: string;

  public status!: string;

  public subscriptionId!: string;
}
