/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface OfferingPurchaseResult {
  productName: string;
  details: string;
  subtitle: string;
  webIcon: string;
}

export interface OfferingDefaultPurchaseResult {
  purchaseDetails: OfferingPurchaseResult & {
    localizations: OfferingPurchaseResult[];
  };
}

export interface OfferingResult {
  stripeProductId: string;
  countries: string[];
  defaultPurchase: OfferingDefaultPurchaseResult;
}
