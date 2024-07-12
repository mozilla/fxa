/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

export interface OfferingPurchaseResult {
  productName: string;
  details: string;
  subtitle: string;
  webIcon: string;
}

export interface OfferingDefaultPurchaseResult {
  purchaseDetails: {
    data: StrapiEntity<
      OfferingPurchaseResult & {
        localizations: {
          data: StrapiEntity<OfferingPurchaseResult>[];
        };
      }
    >;
  };
}

export interface OfferingResult {
  stripeProductId: string;
  countries: string[];
  defaultPurchase: {
    data: StrapiEntity<OfferingDefaultPurchaseResult>;
  };
}
