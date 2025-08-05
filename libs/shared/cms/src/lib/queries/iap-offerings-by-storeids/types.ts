/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Enum_Iap_Interval } from '../../../__generated__/graphql';

export interface IapOfferingSubGroupOfferingResult {
  apiIdentifier: string;
}

export interface IapOfferingSubGroupResult {
  groupName: string;
  offerings: IapOfferingSubGroupOfferingResult[];
}

export interface IapOfferingDefaultPurchaseDetails {
  productName: string;
}
export interface IapOfferingDefaultPurchase {
  purchaseDetails: IapOfferingDefaultPurchaseDetails;
}

export interface IapOfferingResult {
  apiIdentifier: string;
  defaultPurchase: IapOfferingDefaultPurchase;
  subGroups: IapOfferingSubGroupResult[];
}

export interface IapWithOfferingResult {
  storeID: string;
  interval: Enum_Iap_Interval;
  offering: IapOfferingResult;
}

export interface IapOfferingByStoreIDResult {
  iaps: IapWithOfferingResult[];
}
