/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Enum_Cancelinterstitialoffer_Currentinterval,
  Enum_Cancelinterstitialoffer_Upgradeinterval,
} from '../../../__generated__/graphql';

export interface CancelInterstitialOfferOfferingResult {
  stripeProductId: string;
  defaultPurchase: {
    purchaseDetails: {
      productName: string;
      webIcon: string;
      localizations: {
        productName: string;
        webIcon: string
      }[];
    };
  };
}

export interface CancelInterstitialOfferResult {
  cancelInterstitialOffers: CancelInterstitialOffer[];
}
export interface CancelInterstitialOffer {
  offeringApiIdentifier: string;
  currentInterval: Enum_Cancelinterstitialoffer_Currentinterval;
  upgradeInterval: Enum_Cancelinterstitialoffer_Upgradeinterval;
  modalHeading1: string;
  modalMessage: string;
  productPageUrl: string;
  upgradeButtonLabel: string;
  upgradeButtonUrl: string;
  localizations: Partial<CancelInterstitialOffer>[];
  offering: CancelInterstitialOfferOfferingResult;
}

export interface CancelInterstitialOfferTransformed
  extends Omit<
    CancelInterstitialOffer,
    'modalMessage' | 'currentInterval' | 'upgradeInterval'
  > {
  modalMessage: string[];
  currentInterval: string;
  upgradeInterval: string;
}
